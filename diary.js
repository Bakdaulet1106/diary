// Глобальные перемены
let currentTheme = 'sunny';
let currentFiles = [];
let entries = [];
let editingEntryId = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    loadEntries();
    generateQRCode();
    changeTheme('sunny');
    
    // Фокус на редакторе
    document.getElementById('editor').focus();
});

// Функции форматирования текста
function formatText(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('editor').focus();
}

// Смена темы
function changeTheme(theme) {
    currentTheme = theme;
    const background = document.getElementById('theme-background');
    
    // Очищаем предыдущие частицы
    clearWeatherParticles();
    
    // Устанавливаем класс темы
    background.className = `theme-background ${theme}`;
    
    // Запускаем анимации
    createWeatherAnimation(theme);
}

// Создание анимаций погоды
function createWeatherAnimation(theme) {
    const background = document.getElementById('theme-background');
    
    switch(theme) {
        case 'sunny':
            createSunnyAnimation(background);
            break;
        case 'rainy':
            createRainyAnimation(background);
            break;
        case 'snowy':
            createSnowyAnimation(background);
            break;
        case 'matrix':
            createMatrixAnimation(background);
            break;
        case 'cloudy':
            createCloudyAnimation(background);
            break;
    }
}

function createSunnyAnimation(container) {
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.innerHTML = '✨';
        particle.className = 'weather-particle sunny-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.fontSize = (Math.random() * 10 + 15) + 'px';
        container.appendChild(particle);
    }
}

function createRainyAnimation(container) {
    for (let i = 0; i < 100; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '2px';
        particle.style.height = '20px';
        particle.style.background = 'rgba(59, 130, 246, 0.6)';
        particle.className = 'weather-particle rainy-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 2 + 's';
        container.appendChild(particle);
    }
}

function createSnowyAnimation(container) {
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.innerHTML = '❄';
        particle.className = 'weather-particle snowy-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.fontSize = (Math.random() * 10 + 15) + 'px';
        particle.style.color = 'white';
        container.appendChild(particle);
    }
}

function createMatrixAnimation(container) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.innerHTML = characters[Math.floor(Math.random() * characters.length)];
        particle.className = 'weather-particle matrix-particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 5 + 's';
        particle.style.fontSize = (Math.random() * 10 + 14) + 'px';
        container.appendChild(particle);
    }
}

function createCloudyAnimation(container) {
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.innerHTML = '☁️';
        particle.className = 'weather-particle cloudy-particle';
        particle.style.left = Math.random() * 80 + '%';
        particle.style.top = Math.random() * 50 + '%';
        particle.style.animationDelay = Math.random() * 3 + 's';
        particle.style.fontSize = (Math.random() * 20 + 30) + 'px';
        particle.style.opacity = '0.7';
        container.appendChild(particle);
    }
}

function clearWeatherParticles() {
    const particles = document.querySelectorAll('.weather-particle');
    particles.forEach(particle => particle.remove());
}

// Обработка файлов
function handleFiles(files) {
    Array.from(files).forEach(file => {
        if (file.size > 10 * 1024 * 1024) {
            alert(`Файл ${file.name} слишком большой (максимум 10MB)`);
            return;
        }
        
        const fileObj = {
            name: file.name,
            type: file.type,
            url: URL.createObjectURL(file),
            id: Date.now() + Math.random()
        };
        
        currentFiles.push(fileObj);
        displayFile(fileObj);
    });
}

function displayFile(file) {
    const fileList = document.getElementById('file-list');
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    // Определяем иконку и возможность просмотра
    let fileDisplay = '';
    let viewButton = '';
    
    if (file.type.startsWith('image/')) {
        fileDisplay = `<img src="${file.url}" alt="${file.name}" class="file-thumbnail" onclick="openMediaViewer('${file.url}', 'image', '${file.name}')">`;
        viewButton = `<button class="view-file" onclick="openMediaViewer('${file.url}', 'image', '${file.name}')" title="Открыть изображение">👁️</button>`;
    } else if (file.type.startsWith('video/')) {
        fileDisplay = `<video class="file-thumbnail" onclick="openMediaViewer('${file.url}', 'video', '${file.name}')"><source src="${file.url}" type="${file.type}"></video>`;
        viewButton = `<button class="view-file" onclick="openMediaViewer('${file.url}', 'video', '${file.name}')" title="Открыть видео">🎬</button>`;
    } else {
        fileDisplay = `<div class="file-icon">📁</div>`;
        viewButton = `<button class="view-file" onclick="downloadFile('${file.url}', '${file.name}')" title="Скачать файл">⬇️</button>`;
    }
    
    fileItem.innerHTML = `
        ${fileDisplay}
        <div class="file-info">
            <span class="file-name">${file.name}</span>
            <div class="file-actions">
                ${viewButton}
                <button class="remove-file" onclick="removeFile('${file.id}')" title="Удалить файл">❌</button>
            </div>
        </div>
    `;
    fileList.appendChild(fileItem);
}

function removeFile(fileId) {
    currentFiles = currentFiles.filter(file => file.id !== fileId);
    displayFiles();
}

function displayFiles() {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';
    currentFiles.forEach(file => displayFile(file));
}

// Открытие медиа-просмотрщика
function openMediaViewer(url, type, name) {
    const viewer = document.createElement('div');
    viewer.className = 'media-viewer';
    viewer.onclick = function(e) {
        if (e.target === viewer) {
            closeMediaViewer();
        }
    };
    
    let content = '';
    if (type === 'image') {
        content = `<img src="${url}" alt="${name}" class="media-content">`;
    } else if (type === 'video') {
        content = `<video src="${url}" controls class="media-content"></video>`;
    }
    
    viewer.innerHTML = `
        <div class="media-container">
            <div class="media-header">
                <h3>${name}</h3>
                <button class="close-viewer" onclick="closeMediaViewer()">✕</button>
            </div>
            ${content}
        </div>
    `;
    
    document.body.appendChild(viewer);
}

function closeMediaViewer() {
    const viewer = document.querySelector('.media-viewer');
    if (viewer) {
        viewer.remove();
    }
}

function downloadFile(url, name) {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
}

// Сохранение записи
function saveEntry() {
    const title = document.getElementById('entry-title').value.trim();
    const content = document.getElementById('editor').innerHTML.trim();
    
    if (!title || !content) {
        alert('Пожалуйста, заполните заголовок и содержание записи');
        return;
    }
    
    const entry = {
        id: editingEntryId || Date.now().toString(),
        title: title,
        content: content,
        theme: currentTheme,
        date: new Date().toISOString(),
        files: [...currentFiles]
    };
    
    if (editingEntryId) {
        updateEntry(entry);
        editingEntryId = null;
    } else {
        addEntry(entry);
    }
    
    clearEditor();
    displayEntries();
    
    alert('Запись сохранена!');
}

// Очистка редактора
function clearEditor() {
    document.getElementById('entry-title').value = '';
    document.getElementById('editor').innerHTML = '';
    currentFiles = [];
    displayFiles();
    editingEntryId = null;
}

// Отображение записей
function displayEntries() {
    const container = document.getElementById('entries-container');
    container.innerHTML = '';
    
    const sortedEntries = entries.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedEntries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'entry-item';
        
        const date = new Date(entry.date).toLocaleDateString('ru-RU');
        const preview = entry.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...';
        
        // Отображение прикрепленных файлов в записи
        let filesDisplay = '';
        if (entry.files && entry.files.length > 0) {
            filesDisplay = `
                <div class="entry-files">
                    <strong>Прикрепленные файлы:</strong>
                    <div class="entry-files-list">
                        ${entry.files.map(file => {
                            if (file.type.startsWith('image/')) {
                                return `<img src="${file.url}" alt="${file.name}" class="entry-file-thumb" onclick="openMediaViewer('${file.url}', 'image', '${file.name}')" title="${file.name}">`;
                            } else if (file.type.startsWith('video/')) {
                                return `<video class="entry-file-thumb" onclick="openMediaViewer('${file.url}', 'video', '${file.name}')" title="${file.name}"><source src="${file.url}" type="${file.type}"></video>`;
                            } else {
                                return `<div class="entry-file-thumb file-icon" onclick="downloadFile('${file.url}', '${file.name}')" title="${file.name}">📁</div>`;
                            }
                        }).join('')}
                    </div>
                </div>
            `;
        }
        
        entryDiv.innerHTML = `
            <div class="entry-title">${entry.title}</div>
            <div class="entry-date">${date} • ${getThemeName(entry.theme)}</div>
            <div class="entry-preview">${preview}</div>
            ${filesDisplay}
            <div class="entry-actions-btn">
                <button class="edit-btn" onclick="editEntry('${entry.id}')">✏️ Редактировать</button>
                <button class="delete-btn" onclick="deleteEntry('${entry.id}')">🗑️ Удалить</button>
            </div>
        `;
        
        container.appendChild(entryDiv);
    });
}

function getThemeName(theme) {
    const names = {
        'sunny': '☀️ Солнечно',
        'cloudy': '☁️ Облачно',
        'rainy': '🌧️ Дождь',
        'snowy': '❄️ Снег',
        'matrix': '💚 Матрица'
    };
    return names[theme] || '☀️ Солнечно';
}

function editEntry(entryId) {
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    
    editingEntryId = entryId;
    document.getElementById('entry-title').value = entry.title;
    document.getElementById('editor').innerHTML = entry.content;
    document.getElementById('theme').value = entry.theme;
    changeTheme(entry.theme);
    
    currentFiles = [...entry.files];
    displayFiles();
    
    document.querySelector('.editor-section').scrollIntoView({ behavior: 'smooth' });
}

function deleteEntry(entryId) {
    if (confirm('Вы уверены, что хотите удалить эту запись?')) {
        removeEntry(entryId);
        displayEntries();
    }
}

// Генерация QR кода
function generateQRCode() {
    const qrContainer = document.getElementById('qr-code');
    const currentUrl = window.location.href;
    
    // Используем внешний сервис для генерации QR кода
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`;
    
    qrContainer.innerHTML = `<img src="${qrUrl}" alt="QR Code" style="max-width: 100%; border-radius: 8px;">`;
}

// Скачивание QR кода
function downloadQR() {
    const currentUrl = window.location.href;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(currentUrl)}`;
    
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = 'diary-qr-code.png';
    link.click();
}

// Инициализация при загрузке
function loadEntries() {
    entries = getAllEntries();
    displayEntries();
}
