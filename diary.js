
// Главный класс для управления дневником
class DiaryApp {
    constructor() {
        this.db = new DiaryDB();
        this.currentTheme = 'matrix';
        this.init();
    }

    // Инициализация приложения
    init() {
        this.bindEvents();
        this.loadEntries();
        this.setTheme(this.currentTheme);
        this.createAnimations();
    }

    // Привязка событий
    bindEvents() {
        // Селектор темы
        document.getElementById('theme-selector').addEventListener('change', (e) => {
            this.setTheme(e.target.value);
        });

        // Кнопки
        document.getElementById('add-entry-btn').addEventListener('click', () => {
            this.openAddModal();
        });

        document.getElementById('qr-btn').addEventListener('click', () => {
            this.openQRModal();
        });

        // Модальные окна
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeAddModal();
        });

        document.getElementById('close-qr-modal').addEventListener('click', () => {
            this.closeQRModal();
        });

        document.getElementById('save-entry').addEventListener('click', () => {
            this.saveEntry();
        });

        // Закрытие модальных окон по клику вне их
        document.getElementById('add-modal').addEventListener('click', (e) => {
            if (e.target.id === 'add-modal') {
                this.closeAddModal();
            }
        });

        document.getElementById('qr-modal').addEventListener('click', (e) => {
            if (e.target.id === 'qr-modal') {
                this.closeQRModal();
            }
        });

        // Обработка файлов
        document.getElementById('entry-files').addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });
    }

    // Установка темы
    setTheme(theme) {
        this.currentTheme = theme;
        const body = document.body;
        
        // Удаляем старые классы тем
        body.classList.remove('theme-matrix', 'theme-rain', 'theme-snow', 'theme-sunny');
        
        // Добавляем новый класс темы
        body.classList.add(`theme-${theme}`);

        // Управляем фоновыми анимациями
        this.updateBackgroundAnimations(theme);
        
        // Обновляем селектор темы
        document.getElementById('theme-selector').value = theme;
        document.getElementById('entry-theme').value = theme;
    }

    // Обновление фоновых анимаций
    updateBackgroundAnimations(theme) {
        const matrixBg = document.getElementById('matrix-bg');
        const particlesBg = document.getElementById('particles-bg');

        // Очищаем все анимации
        matrixBg.classList.remove('active');
        particlesBg.classList.remove('active');
        matrixBg.innerHTML = '';
        particlesBg.innerHTML = '';

        if (theme === 'matrix') {
            matrixBg.classList.add('active');
            this.createMatrixRain();
        } else {
            particlesBg.classList.add('active');
            this.createParticles(theme);
        }
    }

    // Создание эффекта "дождя" из матрицы
    createMatrixRain() {
        const matrixBg = document.getElementById('matrix-bg');
        const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンabcdefghijklmnopqrstuvwxyz0123456789';
        
        for (let i = 0; i < 100; i++) {
            const char = document.createElement('div');
            char.className = 'matrix-char';
            char.textContent = chars[Math.floor(Math.random() * chars.length)];
            char.style.left = Math.random() * 100 + '%';
            char.style.animationDuration = (Math.random() * 3 + 2) + 's';
            char.style.animationDelay = Math.random() * 2 + 's';
            matrixBg.appendChild(char);
        }
    }

    // Создание летающих частиц
    createParticles(theme) {
        const particlesBg = document.getElementById('particles-bg');
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = `particle ${theme}`;
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 3 + 's';
            particle.style.animationDuration = (Math.random() * 2 + 4) + 's';
            particlesBg.appendChild(particle);
        }
    }

    // Создание общих анимаций
    createAnimations() {
        // Анимация появления элементов при скролле
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationDelay = '0s';
                    entry.target.classList.add('animate-fade-in');
                }
            });
        });

        // Наблюдаем за карточками записей
        document.querySelectorAll('.entry-card').forEach(card => {
            observer.observe(card);
        });
    }

    // Открытие модального окна добавления записи
    openAddModal() {
        document.getElementById('add-modal').classList.add('active');
        document.getElementById('entry-title').focus();
    }

    // Закрытие модального окна добавления записи
    closeAddModal() {
        document.getElementById('add-modal').classList.remove('active');
        this.clearAddForm();
    }

    // Очистка формы добавления записи
    clearAddForm() {
        document.getElementById('entry-title').value = '';
        document.getElementById('entry-content').value = '';
        document.getElementById('entry-files').value = '';
        document.getElementById('entry-theme').value = this.currentTheme;
    }

    // Сохранение записи
    async saveEntry() {
        const title = document.getElementById('entry-title').value.trim();
        const content = document.getElementById('entry-content').value.trim();
        const theme = document.getElementById('entry-theme').value;
        const files = document.getElementById('entry-files').files;

        if (!title || !content) {
            this.showToast('Пожалуйста, заполните все поля', 'error');
            return;
        }

        try {
            // Обработка файлов
            const attachments = await this.processFiles(files);

            const entry = {
                id: Date.now().toString(),
                title,
                content,
                theme,
                date: new Date().toISOString(),
                attachments
            };

            // Сохранение в базу данных
            await this.db.addEntry(entry);
            
            // Обновление интерфейса
            this.loadEntries();
            this.closeAddModal();
            
            this.showToast('Запись успешно добавлена', 'success');
        } catch (error) {
            console.error('Ошибка при сохранении записи:', error);
            this.showToast('Ошибка при сохранении записи', 'error');
        }
    }

    // Обработка файлов
    async processFiles(files) {
        const attachments = [];
        
        for (let file of files) {
            try {
                const dataUrl = await this.fileToDataUrl(file);
                attachments.push({
                    type: this.getFileType(file),
                    name: file.name,
                    url: dataUrl,
                    size: file.size
                });
            } catch (error) {
                console.error('Ошибка при обработке файла:', file.name, error);
            }
        }
        
        return attachments;
    }

    // Конвертация файла в Data URL
    fileToDataUrl(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Определение типа файла
    getFileType(file) {
        if (file.type.startsWith('image/')) return 'image';
        if (file.type.startsWith('video/')) return 'video';
        return 'file';
    }

    // Обработка выбора файлов
    handleFileSelect(event) {
        const files = event.target.files;
        if (files.length > 0) {
            console.log(`Выбрано файлов: ${files.length}`);
        }
    }

    // Загрузка записей
    async loadEntries() {
        try {
            const entries = await this.db.getAllEntries();
            this.renderEntries(entries);
        } catch (error) {
            console.error('Ошибка при загрузке записей:', error);
            this.showToast('Ошибка при загрузке записей', 'error');
        }
    }

    // Отрисовка записей
    renderEntries(entries) {
        const grid = document.getElementById('entries-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (entries.length === 0) {
            grid.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        grid.innerHTML = entries.map(entry => this.createEntryCard(entry)).join('');
        
        // Обновляем наблюдатель для анимаций
        this.createAnimations();
    }

    // Создание карточки записи
    createEntryCard(entry) {
        const themeIcons = {
            matrix: '🟢',
            rain: '🌧️',
            snow: '❄️',
            sunny: '☀️'
        };

        const date = new Date(entry.date).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const attachmentsHtml = entry.attachments && entry.attachments.length > 0 
            ? `<div class="entry-attachments">
                ${entry.attachments.map(att => this.createAttachmentHtml(att)).join('')}
               </div>`
            : '';

        return `
            <div class="entry-card" data-theme="${entry.theme}">
                <div class="entry-header">
                    <span>${themeIcons[entry.theme] || '📝'}</span>
                    <h3 class="entry-title">${this.escapeHtml(entry.title)}</h3>
                </div>
                <div class="entry-date">${date}</div>
                <div class="entry-content">${this.escapeHtml(entry.content)}</div>
                ${attachmentsHtml}
                <input type="file" multiple accept="image/*,video/*,.zip,.rar,.pdf,.doc,.docx" 
                       class="file-input" 
                       onchange="diaryApp.addAttachmentToEntry('${entry.id}', this)">
            </div>
        `;
    }

    // Создание HTML для вложения
    createAttachmentHtml(attachment) {
        const icons = {
            image: '🖼️',
            video: '🎥',
            file: '📎'
        };

        let preview = '';
        if (attachment.type === 'image') {
            preview = `<img src="${attachment.url}" alt="${attachment.name}" class="attachment-preview">`;
        } else if (attachment.type === 'video') {
            preview = `<video src="${attachment.url}" controls class="attachment-preview"></video>`;
        }

        return `
            <div class="attachment-item">
                ${icons[attachment.type]} ${this.escapeHtml(attachment.name)}
                ${preview}
            </div>
        `;
    }

    // Добавление вложения к существующей записи
    async addAttachmentToEntry(entryId, fileInput) {
        const files = fileInput.files;
        if (!files.length) return;

        try {
            const newAttachments = await this.processFiles(files);
            await this.db.addAttachmentsToEntry(entryId, newAttachments);
            this.loadEntries();
            this.showToast('Файлы добавлены к записи', 'success');
        } catch (error) {
            console.error('Ошибка при добавлении файлов:', error);
            this.showToast('Ошибка при добавлении файлов', 'error');
        }
    }

    // Открытие QR модального окна
    openQRModal() {
        const qrContainer = document.getElementById('qr-code');
        const qrData = this.generateQRData();
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
        
        qrContainer.innerHTML = `<img src="${qrUrl}" alt="QR Code">`;
        document.getElementById('qr-modal').classList.add('active');
    }

    // Закрытие QR модального окна
    closeQRModal() {
        document.getElementById('qr-modal').classList.remove('active');
    }

    // Генерация данных для QR кода
    generateQRData() {
        const currentUrl = window.location.href;
        const entriesCount = this.db.getEntriesCount();
        
        return JSON.stringify({
            url: currentUrl,
            entries: entriesCount,
            lastUpdate: new Date().toISOString(),
            message: 'Цифровой дневник - отчеты и записи'
        });
    }

    // Показ уведомления
    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Автоматическое удаление через 3 секунды
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Экранирование HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Инициализация приложения
let diaryApp;
document.addEventListener('DOMContentLoaded', () => {
    diaryApp = new DiaryApp();
});
