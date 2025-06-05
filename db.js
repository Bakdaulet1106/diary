
// Класс для управления базой данных дневника
class DiaryDB {
    constructor() {
        this.dbName = 'DiaryDB';
        this.version = 1;
        this.db = null;
        this.init();
    }

    // Инициализация IndexedDB
    async init() {
        try {
            this.db = await this.openDB();
            console.log('База данных инициализирована');
        } catch (error) {
            console.error('Ошибка инициализации базы данных:', error);
            // Fallback на localStorage
            this.useLocalStorage = true;
        }
    }

    // Открытие базы данных
    openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                reject(request.error);
            };

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Создание хранилища для записей
                if (!db.objectStoreNames.contains('entries')) {
                    const entriesStore = db.createObjectStore('entries', { keyPath: 'id' });
                    entriesStore.createIndex('date', 'date', { unique: false });
                    entriesStore.createIndex('theme', 'theme', { unique: false });
                }

                // Создание хранилища для настроек
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    // Добавление записи
    async addEntry(entry) {
        if (this.useLocalStorage) {
            return this.addEntryLocalStorage(entry);
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readwrite');
            const store = transaction.objectStore('entries');
            const request = store.add(entry);

            request.onsuccess = () => {
                console.log('Запись добавлена:', entry.id);
                resolve(entry);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Получение всех записей
    async getAllEntries() {
        if (this.useLocalStorage) {
            return this.getAllEntriesLocalStorage();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readonly');
            const store = transaction.objectStore('entries');
            const request = store.getAll();

            request.onsuccess = () => {
                // Сортировка по дате (новые сначала)
                const entries = request.result.sort((a, b) => new Date(b.date) - new Date(a.date));
                resolve(entries);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Получение записи по ID
    async getEntryById(id) {
        if (this.useLocalStorage) {
            return this.getEntryByIdLocalStorage(id);
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readonly');
            const store = transaction.objectStore('entries');
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Обновление записи
    async updateEntry(entry) {
        if (this.useLocalStorage) {
            return this.updateEntryLocalStorage(entry);
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readwrite');
            const store = transaction.objectStore('entries');
            const request = store.put(entry);

            request.onsuccess = () => {
                console.log('Запись обновлена:', entry.id);
                resolve(entry);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Удаление записи
    async deleteEntry(id) {
        if (this.useLocalStorage) {
            return this.deleteEntryLocalStorage(id);
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries'], 'readwrite');
            const store = transaction.objectStore('entries');
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('Запись удалена:', id);
                resolve(true);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Добавление вложений к записи
    async addAttachmentsToEntry(entryId, newAttachments) {
        try {
            const entry = await this.getEntryById(entryId);
            if (!entry) {
                throw new Error('Запись не найдена');
            }

            entry.attachments = entry.attachments || [];
            entry.attachments.push(...newAttachments);
            
            return await this.updateEntry(entry);
        } catch (error) {
            console.error('Ошибка добавления вложений:', error);
            throw error;
        }
    }

    // Получение количества записей
    getEntriesCount() {
        if (this.useLocalStorage) {
            const entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
            return entries.length;
        }
        
        // Для IndexedDB возвращаем приблизительное количество
        return 0;
    }

    // Экспорт данных
    async exportData() {
        try {
            const entries = await this.getAllEntries();
            const settings = await this.getSettings();
            
            return {
                entries,
                settings,
                exportDate: new Date().toISOString(),
                version: this.version
            };
        } catch (error) {
            console.error('Ошибка экспорта данных:', error);
            throw error;
        }
    }

    // Импорт данных
    async importData(data) {
        try {
            if (!data.entries || !Array.isArray(data.entries)) {
                throw new Error('Неверный формат данных');
            }

            // Очистка текущих данных
            await this.clearAllData();

            // Импорт записей
            for (const entry of data.entries) {
                await this.addEntry(entry);
            }

            // Импорт настроек
            if (data.settings) {
                await this.saveSettings(data.settings);
            }

            console.log('Данные успешно импортированы');
            return true;
        } catch (error) {
            console.error('Ошибка импорта данных:', error);
            throw error;
        }
    }

    // Очистка всех данных
    async clearAllData() {
        if (this.useLocalStorage) {
            localStorage.removeItem('diaryEntries');
            localStorage.removeItem('diarySettings');
            return;
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['entries', 'settings'], 'readwrite');
            
            transaction.oncomplete = () => {
                console.log('Все данные очищены');
                resolve(true);
            };

            transaction.onerror = () => {
                reject(transaction.error);
            };

            transaction.objectStore('entries').clear();
            transaction.objectStore('settings').clear();
        });
    }

    // Получение настроек
    async getSettings() {
        if (this.useLocalStorage) {
            return JSON.parse(localStorage.getItem('diarySettings') || '{}');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.getAll();

            request.onsuccess = () => {
                const settings = {};
                request.result.forEach(item => {
                    settings[item.key] = item.value;
                });
                resolve(settings);
            };

            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    // Сохранение настроек
    async saveSettings(settings) {
        if (this.useLocalStorage) {
            localStorage.setItem('diarySettings', JSON.stringify(settings));
            return;
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');

            transaction.oncomplete = () => {
                resolve(true);
            };

            transaction.onerror = () => {
                reject(transaction.error);
            };

            Object.entries(settings).forEach(([key, value]) => {
                store.put({ key, value });
            });
        });
    }

    // Методы для работы с localStorage (fallback)
    addEntryLocalStorage(entry) {
        const entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
        entries.unshift(entry);
        localStorage.setItem('diaryEntries', JSON.stringify(entries));
        return Promise.resolve(entry);
    }

    getAllEntriesLocalStorage() {
        const entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
        return Promise.resolve(entries);
    }

    getEntryByIdLocalStorage(id) {
        const entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
        const entry = entries.find(e => e.id === id);
        return Promise.resolve(entry);
    }

    updateEntryLocalStorage(entry) {
        const entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
        const index = entries.findIndex(e => e.id === entry.id);
        if (index !== -1) {
            entries[index] = entry;
            localStorage.setItem('diaryEntries', JSON.stringify(entries));
        }
        return Promise.resolve(entry);
    }

    deleteEntryLocalStorage(id) {
        const entries = JSON.parse(localStorage.getItem('diaryEntries') || '[]');
        const filteredEntries = entries.filter(e => e.id !== id);
        localStorage.setItem('diaryEntries', JSON.stringify(filteredEntries));
        return Promise.resolve(true);
    }
}

