// 在文件开头添加
let isProcessing = false;

// 获取DOM元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const uploadBtn = document.querySelector('.upload-btn');
const previewContainer = document.querySelector('.preview-container');
const controlPanel = document.querySelector('.control-panel');
const originalImage = document.getElementById('originalImage');
const compressedImage = document.getElementById('compressedImage');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const downloadBtn = document.getElementById('downloadBtn');

// 文件上传处理
uploadBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', handleFileSelect);
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#007AFF';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#E5E5E5';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '#E5E5E5';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleFileSelect({ target: fileInput });
    }
});

// 处理文件选择
function handleFileSelect(e) {
    if (isProcessing) return;
    
    const file = e.target.files[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.match('image.*')) {
        alert('Please select an image file!');
        return;
    }

    // 检查文件大小
    if (file.size > 10 * 1024 * 1024) { // 10MB
        alert('File size cannot exceed 10MB!');
        return;
    }

    isProcessing = true;
    dropZone.classList.add('loading');

    // 显示原图大小
    originalSize.textContent = formatFileSize(file.size);

    // 预览原图
    const reader = new FileReader();
    reader.onload = (e) => {
        originalImage.src = e.target.result;
        compressImage(e.target.result);
    };
    reader.onerror = () => {
        alert('Failed to read file, please try again!');
        isProcessing = false;
        dropZone.classList.remove('loading');
    };
    reader.readAsDataURL(file);

    // 显示预览和控制面板
    previewContainer.style.display = 'grid';
    controlPanel.style.display = 'block';
}

// 压缩图片
function compressImage(base64) {
    const img = new Image();
    img.src = base64;
    img.onerror = () => {
        alert('Image processing failed, please try again!');
        isProcessing = false;
        dropZone.classList.remove('loading');
    };
    img.onload = () => {
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // 保持原始尺寸
            canvas.width = img.width;
            canvas.height = img.height;

            // 绘制图片
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 压缩
            const quality = qualitySlider.value / 100;
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            
            // 显示压缩后的图片
            compressedImage.src = compressedBase64;
            
            // 计算压缩后的大小
            const compressedSize = Math.round((compressedBase64.length * 3) / 4);
            document.getElementById('compressedSize').textContent = formatFileSize(compressedSize);
        } catch (error) {
            alert('Image processing failed, please try again!');
        } finally {
            isProcessing = false;
            dropZone.classList.remove('loading');
        }
    };
}

// 质量滑块事件
qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = e.target.value + '%';
    if (originalImage.src) {
        compressImage(originalImage.src);
    }
});

// 下载按钮事件
downloadBtn.addEventListener('click', () => {
    if (!compressedImage.src) return;
    
    const link = document.createElement('a');
    link.download = 'compressed-image.jpg';
    link.href = compressedImage.src;
    link.click();
});

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
} 