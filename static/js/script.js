// Global variables
let selectedImage = null;
let analysisResults = null;

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const uploadPreview = document.getElementById('uploadPreview');
const previewImage = document.getElementById('previewImage');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsSection = document.getElementById('resultsSection');
const loadingOverlay = document.getElementById('loadingOverlay');
const toastContainer = document.getElementById('toastContainer');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadSoilTypes();
});

// Initialize event listeners
function initializeEventListeners() {
    // Upload area click
    uploadArea.addEventListener('click', () => imageInput.click());
    
    // File input change
    imageInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Smooth scrolling for navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        selectedImage = file;
        displayImagePreview(file);
    } else {
        showToast('Please select a valid image file', 'error');
    }
}

// Handle drag over
function handleDragOver(event) {
    event.preventDefault();
    uploadArea.classList.add('dragover');
}

// Handle drag leave
function handleDragLeave(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
}

// Handle drop
function handleDrop(event) {
    event.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        if (file.type.startsWith('image/')) {
            selectedImage = file;
            displayImagePreview(file);
        } else {
            showToast('Please select a valid image file', 'error');
        }
    }
}

// Display image preview
function displayImagePreview(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImage.src = e.target.result;
        uploadArea.style.display = 'none';
        uploadPreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// Remove image
function removeImage() {
    selectedImage = null;
    imageInput.value = '';
    uploadArea.style.display = 'block';
    uploadPreview.style.display = 'none';
    previewImage.src = '';
}

// Perform analysis
async function performAnalysis() {
    if (!selectedImage) {
        showToast('Please select an image first', 'error');
        return;
    }
    
    showLoading(true);
    
    try {
        const formData = new FormData();
        formData.append('image', selectedImage);
        
        // Add environmental parameters if provided
        const envParams = getEnvironmentalParameters();
        if (Object.keys(envParams).length > 0) {
            formData.append('environmental_params', JSON.stringify(envParams));
        }
        
        const response = await fetch('/api/complete-analysis', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
            analysisResults = result;
            displayResults(result);
            showToast('Analysis completed successfully!', 'success');
        } else {
            showToast(result.detail || 'Analysis failed', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('An error occurred during analysis', 'error');
    } finally {
        showLoading(false);
    }
}

// Get environmental parameters
function getEnvironmentalParameters() {
    const params = {};
    const inputs = ['nitrogen', 'phosphorus', 'potassium', 'temperature', 'humidity', 'ph', 'rainfall'];
    
    inputs.forEach(input => {
        const value = document.getElementById(input).value;
        if (value && value.trim() !== '') {
            const paramName = input === 'ph' ? 'pH' : input.charAt(0).toUpperCase() + input.slice(1);
            params[paramName] = parseFloat(value);
        }
    });
    
    return params;
}

// Display results
function displayResults(result) {
    // Show results section
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Update soil analysis
    document.getElementById('soilType').textContent = result.soil_type || 'Unknown';
    document.getElementById('soilConfidence').textContent = 
        result.soil_confidence ? `${result.soil_confidence.toFixed(1)}%` : 'Unknown';
    
    // Update environmental conditions
    displayEnvironmentalConditions(result.environmental_parameters);
    
    // Update crop recommendations
    displayCropRecommendations(result.recommendations);
    
    // Update soil-specific crops
    displaySoilSpecificCrops(result.soil_specific_crops);
}

// Display environmental conditions
function displayEnvironmentalConditions(envParams) {
    const envGrid = document.getElementById('envGrid');
    envGrid.innerHTML = '';
    
    if (!envParams) return;
    
    const envItems = [
        { key: 'N', label: 'Nitrogen', unit: 'ppm' },
        { key: 'P', label: 'Phosphorus', unit: 'ppm' },
        { key: 'K', label: 'Potassium', unit: 'ppm' },
        { key: 'temperature', label: 'Temperature', unit: '°C' },
        { key: 'humidity', label: 'Humidity', unit: '%' },
        { key: 'pH', label: 'pH Level', unit: '' },
        { key: 'rainfall', label: 'Rainfall', unit: 'mm' }
    ];
    
    envItems.forEach(item => {
        if (envParams[item.key] !== undefined) {
            const envItem = document.createElement('div');
            envItem.className = 'env-item';
            envItem.innerHTML = `
                <span class="value">${envParams[item.key].toFixed(1)}${item.unit}</span>
                <span class="label">${item.label}</span>
            `;
            envGrid.appendChild(envItem);
        }
    });
}

// Display crop recommendations
function displayCropRecommendations(recommendations) {
    const cropsGrid = document.getElementById('cropsGrid');
    cropsGrid.innerHTML = '';
    
    if (!recommendations || recommendations.length === 0) {
        cropsGrid.innerHTML = '<p>No recommendations available</p>';
        return;
    }
    
    recommendations.forEach((rec, index) => {
        const cropItem = document.createElement('div');
        cropItem.className = `crop-item ${rec.soil_suitable ? 'suitable' : 'not-suitable'}`;
        
        const indicator = rec.soil_suitable ? '✅' : '⚠️';
        const suitability = rec.soil_suitable ? 'Highly Suitable' : 'Moderately Suitable';
        
        cropItem.innerHTML = `
            <div class="crop-name">
                <span>${indicator}</span>
                <span>${rec.crop.charAt(0).toUpperCase() + rec.crop.slice(1)}</span>
                <small style="color: #666; margin-left: 0.5rem;">(${suitability})</small>
            </div>
            <div class="crop-score">
                ${(rec.score * 100).toFixed(1)}%
            </div>
        `;
        
        cropsGrid.appendChild(cropItem);
    });
}

// Display soil-specific crops
function displaySoilSpecificCrops(soilCrops) {
    const soilCropsContainer = document.getElementById('soilCrops');
    soilCropsContainer.innerHTML = '';
    
    if (!soilCrops || soilCrops.length === 0) {
        soilCropsContainer.innerHTML = '<p>No soil-specific crops available</p>';
        return;
    }
    
    soilCrops.forEach(crop => {
        const tag = document.createElement('span');
        tag.className = 'soil-crop-tag';
        tag.textContent = crop.charAt(0).toUpperCase() + crop.slice(1);
        soilCropsContainer.appendChild(tag);
    });
}

// Load soil types (for future use)
async function loadSoilTypes() {
    try {
        const response = await fetch('/api/soil-types');
        const result = await response.json();
        
        if (result.success) {
            // Store soil types for future use
            window.soilTypes = result.soil_types;
            window.soilCropMapping = result.soil_crop_mapping;
        }
    } catch (error) {
        console.error('Error loading soil types:', error);
    }
}

// Show/hide loading overlay
function showLoading(show) {
    if (show) {
        loadingOverlay.classList.add('show');
    } else {
        loadingOverlay.classList.remove('show');
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
    }
}

// Download results
function downloadResults() {
    if (!analysisResults) {
        showToast('No results to download', 'error');
        return;
    }
    
    const report = generateReport(analysisResults);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `crop_analysis_report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Report downloaded successfully!', 'success');
}

// Generate text report
function generateReport(results) {
    const timestamp = new Date().toLocaleString();
    
    let report = `CROP & SOIL ANALYSIS REPORT
Generated on: ${timestamp}

SOIL ANALYSIS:
==============
Soil Type: ${results.soil_type || 'Unknown'}
Confidence: ${results.soil_confidence ? results.soil_confidence.toFixed(1) + '%' : 'Unknown'}

ENVIRONMENTAL CONDITIONS:
========================
`;
    
    if (results.environmental_parameters) {
        Object.entries(results.environmental_parameters).forEach(([key, value]) => {
            report += `${key}: ${value}\n`;
        });
    }
    
    report += `\nRECOMMENDED CROPS:
==================
`;
    
    if (results.recommendations) {
        results.recommendations.forEach((rec, index) => {
            const suitability = rec.soil_suitable ? 'Highly Suitable' : 'Moderately Suitable';
            report += `${index + 1}. ${rec.crop.charAt(0).toUpperCase() + rec.crop.slice(1)} (${suitability}) - Score: ${(rec.score * 100).toFixed(1)}%\n`;
        });
    }
    
    if (results.soil_specific_crops && results.soil_specific_crops.length > 0) {
        report += `\nSOIL-SPECIFIC CROPS:
===================
${results.soil_specific_crops.map(crop => crop.charAt(0).toUpperCase() + crop.slice(1)).join(', ')}\n`;
    }
    
    report += `\n--- End of Report ---`;
    
    return report;
}

// Utility functions
function formatNumber(num, decimals = 1) {
    return parseFloat(num).toFixed(decimals);
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showToast('An unexpected error occurred', 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showToast('An error occurred while processing your request', 'error');
});
