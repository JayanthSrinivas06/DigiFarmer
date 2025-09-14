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
    initializeAnimations();
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
    
    // Add hover effects to cards
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Initialize animations
function initializeAnimations() {
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe cards and sections
    document.querySelectorAll('.card, .feature-highlight').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Handle file selection
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            showToast('File size too large. Please select an image under 10MB.', 'error');
            return;
        }
        selectedImage = file;
        displayImagePreview(file);
        showToast('Image uploaded successfully!', 'success');
    } else {
        showToast('Please select a valid image file (JPG, PNG, WebP)', 'error');
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
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                showToast('File size too large. Please select an image under 10MB.', 'error');
                return;
            }
            selectedImage = file;
            displayImagePreview(file);
            showToast('Image uploaded successfully!', 'success');
        } else {
            showToast('Please select a valid image file (JPG, PNG, WebP)', 'error');
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
        
        // Add animation
        uploadPreview.style.opacity = '0';
        uploadPreview.style.transform = 'scale(0.8)';
        setTimeout(() => {
            uploadPreview.style.transition = 'all 0.3s ease';
            uploadPreview.style.opacity = '1';
            uploadPreview.style.transform = 'scale(1)';
        }, 100);
    };
    reader.readAsDataURL(file);
}

// Remove image
function removeImage() {
    selectedImage = null;
    imageInput.value = '';
    
    // Animate out
    uploadPreview.style.transition = 'all 0.3s ease';
    uploadPreview.style.opacity = '0';
    uploadPreview.style.transform = 'scale(0.8)';
    
    setTimeout(() => {
        uploadArea.style.display = 'block';
        uploadPreview.style.display = 'none';
        previewImage.src = '';
        
        // Animate in
        uploadArea.style.opacity = '0';
        uploadArea.style.transform = 'scale(0.8)';
        setTimeout(() => {
            uploadArea.style.transition = 'all 0.3s ease';
            uploadArea.style.opacity = '1';
            uploadArea.style.transform = 'scale(1)';
        }, 100);
    }, 300);
    
    showToast('Image removed', 'success');
}

// Perform analysis
async function performAnalysis() {
    if (!selectedImage) {
        showToast('Please select an image first', 'error');
        scrollToSection('analysis');
        return;
    }
    
    // Disable button and show loading
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
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
            showToast('Analysis completed successfully! 🎉', 'success');
            
            // Scroll to results with delay
            setTimeout(() => {
                scrollToSection('results');
            }, 500);
        } else {
            showToast(result.detail || 'Analysis failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showToast('Network error. Please check your connection and try again.', 'error');
    } finally {
        showLoading(false);
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-magic"></i> Analyze Soil & Get Recommendations';
    }
}

// Get environmental parameters
function getEnvironmentalParameters() {
    const params = {};
    const inputs = ['nitrogen', 'phosphorus', 'potassium', 'temperature', 'humidity', 'ph', 'rainfall'];
    
    inputs.forEach(input => {
        const value = document.getElementById(input).value;
        if (value && value.trim() !== '') {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                const paramName = input === 'ph' ? 'pH' : input.charAt(0).toUpperCase() + input.slice(1);
                params[paramName] = numValue;
            }
        }
    });
    
    return params;
}

// Display results
function displayResults(result) {
    // Show results section with animation
    resultsSection.style.display = 'block';
    resultsSection.style.opacity = '0';
    resultsSection.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        resultsSection.style.transition = 'all 0.6s ease';
        resultsSection.style.opacity = '1';
        resultsSection.style.transform = 'translateY(0)';
    }, 100);
    
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
    
    // Add confidence color coding
    const confidenceElement = document.getElementById('soilConfidence');
    const confidence = result.soil_confidence;
    if (confidence >= 80) {
        confidenceElement.style.color = '#48bb78';
    } else if (confidence >= 60) {
        confidenceElement.style.color = '#ed8936';
    } else {
        confidenceElement.style.color = '#e53e3e';
    }
}

// Display environmental conditions
function displayEnvironmentalConditions(envParams) {
    const envGrid = document.getElementById('envGrid');
    envGrid.innerHTML = '';
    
    if (!envParams) return;
    
    const envItems = [
        { key: 'N', label: 'Nitrogen', unit: 'ppm', icon: 'fas fa-atom' },
        { key: 'P', label: 'Phosphorus', unit: 'ppm', icon: 'fas fa-flask' },
        { key: 'K', label: 'Potassium', unit: 'ppm', icon: 'fas fa-vial' },
        { key: 'temperature', label: 'Temperature', unit: '°C', icon: 'fas fa-thermometer-half' },
        { key: 'humidity', label: 'Humidity', unit: '%', icon: 'fas fa-tint' },
        { key: 'pH', label: 'pH Level', unit: '', icon: 'fas fa-balance-scale' },
        { key: 'rainfall', label: 'Rainfall', unit: 'mm', icon: 'fas fa-cloud-rain' }
    ];
    
    envItems.forEach((item, index) => {
        if (envParams[item.key] !== undefined) {
            const envItem = document.createElement('div');
            envItem.className = 'env-item';
            envItem.style.animationDelay = `${index * 0.1}s`;
            envItem.innerHTML = `
                <i class="${item.icon}" style="font-size: 1.5rem; color: #48bb78; margin-bottom: 0.5rem;"></i>
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
        cropsGrid.innerHTML = '<p style="text-align: center; color: #718096; font-size: 1.1rem;">No recommendations available</p>';
        return;
    }
    
    recommendations.forEach((rec, index) => {
        const cropItem = document.createElement('div');
        cropItem.className = `crop-item ${rec.soil_suitable ? 'suitable' : 'not-suitable'}`;
        cropItem.style.animationDelay = `${index * 0.1}s`;
        
        const indicator = rec.soil_suitable ? '✅' : '⚠️';
        const suitability = rec.soil_suitable ? 'Highly Suitable' : 'Moderately Suitable';
        const scoreColor = rec.soil_suitable ? '#48bb78' : '#ed8936';
        
        cropItem.innerHTML = `
            <div class="crop-name">
                <span style="font-size: 1.2rem;">${indicator}</span>
                <span>${rec.crop.charAt(0).toUpperCase() + rec.crop.slice(1)}</span>
                <small style="color: #718096; margin-left: 0.5rem; font-weight: 500;">(${suitability})</small>
            </div>
            <div class="crop-score" style="color: ${scoreColor};">
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
        soilCropsContainer.innerHTML = '<p style="text-align: center; color: #718096; font-size: 1.1rem;">No soil-specific crops available</p>';
        return;
    }
    
    soilCrops.forEach((crop, index) => {
        const tag = document.createElement('span');
        tag.className = 'soil-crop-tag';
        tag.style.animationDelay = `${index * 0.1}s`;
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
    
    // Add icon based on type
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        info: 'fas fa-info-circle'
    };
    
    toast.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="${icons[type] || icons.info}" style="color: ${type === 'success' ? '#48bb78' : type === 'error' ? '#e53e3e' : '#4299e1'};"></i>
            <span>${message}</span>
        </div>
    `;
    
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
        const navHeight = document.querySelector('.navbar').offsetHeight;
        const targetPosition = section.offsetTop - navHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
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
    
    showToast('Report downloaded successfully! 📄', 'success');
}

// Generate text report
function generateReport(results) {
    const timestamp = new Date().toLocaleString();
    
    let report = `🌱 CROP & SOIL ANALYSIS REPORT
Generated on: ${timestamp}

═══════════════════════════════════════════════════════════════

🔬 SOIL ANALYSIS:
Soil Type: ${results.soil_type || 'Unknown'}
Confidence: ${results.soil_confidence ? results.soil_confidence.toFixed(1) + '%' : 'Unknown'}

🌡️ ENVIRONMENTAL CONDITIONS:
`;
    
    if (results.environmental_parameters) {
        Object.entries(results.environmental_parameters).forEach(([key, value]) => {
            const units = {
                'N': 'ppm', 'P': 'ppm', 'K': 'ppm',
                'temperature': '°C', 'humidity': '%', 'pH': '', 'rainfall': 'mm'
            };
            report += `${key}: ${value}${units[key] || ''}\n`;
        });
    }
    
    report += `\n🌾 RECOMMENDED CROPS:
`;
    
    if (results.recommendations) {
        results.recommendations.forEach((rec, index) => {
            const suitability = rec.soil_suitable ? 'Highly Suitable ✅' : 'Moderately Suitable ⚠️';
            report += `${index + 1}. ${rec.crop.charAt(0).toUpperCase() + rec.crop.slice(1)} (${suitability}) - Score: ${(rec.score * 100).toFixed(1)}%\n`;
        });
    }
    
    if (results.soil_specific_crops && results.soil_specific_crops.length > 0) {
        report += `\n🌱 SOIL-SPECIFIC CROPS:
${results.soil_specific_crops.map(crop => `• ${crop.charAt(0).toUpperCase() + crop.slice(1)}`).join('\n')}\n`;
    }
    
    report += `\n═══════════════════════════════════════════════════════════════
Generated by CropAI - AI-Powered Agricultural Recommendations
`;
    
    return report;
}

// Utility functions
function formatNumber(num, decimals = 1) {
    return parseFloat(num).toFixed(decimals);
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Add smooth reveal animation for results
function animateResults() {
    const resultCards = document.querySelectorAll('.result-card');
    resultCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 200);
    });
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
    showToast('An unexpected error occurred. Please refresh and try again.', 'error');
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    showToast('A network error occurred. Please check your connection.', 'error');
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + U to upload image
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        imageInput.click();
    }
    
    // Ctrl/Cmd + Enter to analyze
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        performAnalysis();
    }
    
    // Escape to close loading overlay
    if (e.key === 'Escape' && loadingOverlay.classList.contains('show')) {
        showLoading(false);
    }
});