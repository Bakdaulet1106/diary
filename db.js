
// Простая база данных используя localStorage

// Ключи для хранения данных в localStorage
const ENTRIES_KEY = 'diary_entries';
const FILES_KEY = 'diary_files';

// === РАБОТА С ЗАПИСЯМИ ===

// Получить все записи
function getAllEntries() {
    try {
        const stored = localStorage.getItem(ENTRIES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Ошибка при загрузке записей:', error);
        return [];
    }
}

// Сохранить все записи
function saveAllEntries(entries) {
    try {
        localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
        return true;
    } catch (error) {
        console.error('Ошибка при сохранении записей:', error);
        alert('Ошибка при сохранении. Возможно, закончилось место в хранилище.');
        return false;
    }
}

// Добавить новую запись
function addEntry(entry) {
    const entries = getAllEntries();
    entries.push(entry);
    window.entries = entries; // Обновляем глобальную переменную
    return saveAllEntries(entries);
}

// Обновить существующую запись
function updateEntry(updatedEntry) {
    let entries = getAllEntries();
    const index = entries.findIndex(entry => entry.id === updatedEntry.id);
    
    if (index !== -1) {
        entries[index] = updatedEntry;
        window.entries = entries; // Обновляем глобальную переменную
        return saveAllEntries(entries);
    }
    
    return false;
}

// Удалить запись
function removeEntry(entryId) {
    let entries = getAllEntries();
    entries = entries.filter(entry => entry.id !== entryId);
    window.entries = entries; // Обновляем глобальную переменную
    return saveAllEntries(entries);
}

// Получить запись по ID
function getEntryById(entryId) {
    const entries = getAllEntries();
    return entries.find(entry => entry.id === entryId);
}

// Очистить все записи (для отладки)
function clearAllEntries() {
    if (confirm('Вы уверены, что хотите удалить ВСЕ записи? Это действие нельзя отменить!')) {
        localStorage.removeItem(ENTRIES_KEY);
        window.entries = [];
        if (window.displayEntries) {
            window.displayEntries();
        }
        alert('Все записи удалены');
        return true;
    }
    return false;
}

// === РАБОТА С ФАЙЛАМИ ===

// Получить все файлы из глобального хранилища
function getAllFiles() {
    try {
        const stored = localStorage.getItem(FILES_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Ошибка при загрузке файлов:', error);
        return [];
    }
}

// Сохранить все файлы в глобальное хранилище
function saveAllFiles(files) {
    try {
        localStorage.setItem(FILES_KEY, JSON.stringify(files));
        return true;
    } catch (error) {
        console.error('Ошибка при сохранении файлов:', error);
        alert('Ошибка при сохранении файлов. Возможно, файл слишком большой для localStorage.');
        return false;
    }
}

// Сохранить файл в глобальное хранилище
function saveFileToGlobalStorage(fileObj) {
    try {
        const files = getAllFiles();
        
        // Проверяем, не существует ли уже такой файл
        const existingFileIndex = files.findIndex(f => f.name === fileObj.name && f.size === fileObj.size);
        
        if (existingFileIndex === -1) {
            files.push(fileObj);
            return saveAllFiles(files);
        } else {
            console.log('Файл уже существует в хранилище:', fileObj.name);
            return true;
        }
    } catch (error) {
        console.error('Ошибка при сохранении файла:', error);
        return false;
    }
}

// Удалить файл из глобального хранилища
function removeFileFromGlobalStorage(fileId) {
    try {
        let files = getAllFiles();
        files = files.filter(file => file.id !== fileId);
        return saveAllFiles(files);
    } catch (error) {
        console.error('Ошибка при удалении файла:', error);
        return false;
    }
}

// Очистить все файлы из глобального хранилища
function clearGlobalFileStorage() {
    try {
        localStorage.removeItem(FILES_KEY);
        return true;
    } catch (error) {
        console.error('Ошибка при очистке файлов:', error);
        return false;
    }
}

// Найти файл по ID
function getFileById(fileId) {
    const files = getAllFiles();
    return files.find(file => file.id === fileId);
}

// Получить файлы по типу
function getFilesByType(type) {
    const files = getAllFiles();
    return files.filter(file => file.type.startsWith(type));
}

// === ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ ===

// Экспорт данных в JSON (включая файлы)
function exportData() {
    const entries = getAllEntries();
    const files = getAllFiles();
    
    const exportData = {
        entries: entries,
        files: files,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `diary_full_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Импорт данных из JSON (включая файлы)
function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            let entriesToImport = [];
            let filesToImport = [];
            
            // Проверяем формат данных
            if (importedData.entries && importedData.files) {
                // Новый формат с файлами
                entriesToImport = importedData.entries;
                filesToImport = importedData.files;
            } else if (Array.isArray(importedData)) {
                // Старый формат - только записи
                entriesToImport = importedData;
            } else {
                alert('Неверный формат файла');
                return;
            }
            
            const confirmMsg = `Импортировать ${entriesToImport.length} записей${filesToImport.length > 0 ? ' и ' + filesToImport.length + ' файлов' : ''}? Это заменит все текущие данные.`;
            
            if (confirm(confirmMsg)) {
                saveAllEntries(entriesToImport);
                if (filesToImport.length > 0) {
                    saveAllFiles(filesToImport);
                }
                
                window.entries = entriesToImport;
                if (window.displayEntries) {
                    window.displayEntries();
                }
                if (window.displayAllFiles) {
                    window.displayAllFiles();
                }
                alert('Данные успешно импортированы!');
            }
        } catch (error) {
            alert('Ошибка при чтении файла: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// Получить статистику
function getStats() {
    const entries = getAllEntries();
    const files = getAllFiles();
    const themes = {};
    let totalWords = 0;
    let totalFileSize = 0;
    
    entries.forEach(entry => {
        // Подсчет тем
        themes[entry.theme] = (themes[entry.theme] || 0) + 1;
        
        // Подсчет слов (примерный)
        const text = entry.content.replace(/<[^>]*>/g, '');
        totalWords += text.split(/\s+/).filter(word => word.length > 0).length;
    });
    
    files.forEach(file => {
        totalFileSize += file.size || 0;
    });
    
    return {
        totalEntries: entries.length,
        totalWords: totalWords,
        totalFiles: files.length,
        totalFileSize: totalFileSize,
        themes: themes,
        averageWordsPerEntry: entries.length > 0 ? Math.round(totalWords / entries.length) : 0
    };
}

// Поиск записей
function searchEntries(query) {
    const entries = getAllEntries();
    const searchTerm = query.toLowerCase();
    
    return entries.filter(entry => {
        const title = entry.title.toLowerCase();
        const content = entry.content.replace(/<[^>]*>/g, '').toLowerCase();
        
        return title.includes(searchTerm) || content.includes(searchTerm);
    });
}

// Поиск файлов
function searchFiles(query) {
    const files = getAllFiles();
    const searchTerm = query.toLowerCase();
    
    return files.filter(file => {
        return file.name.toLowerCase().includes(searchTerm);
    });
}

// Очистка устаревших данных (если нужно освободить место)
function cleanupOldData(daysBefore = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBefore);
    
    if (confirm(`Удалить все записи и файлы старше ${daysBefore} дней?`)) {
        let entries = getAllEntries();
        let files = getAllFiles();
        
        entries = entries.filter(entry => new Date(entry.date) > cutoffDate);
        files = files.filter(file => new Date(file.uploadDate) > cutoffDate);
        
        saveAllEntries(entries);
        saveAllFiles(files);
        
        window.entries = entries;
        if (window.displayEntries) {
            window.displayEntries();
        }
        if (window.displayAllFiles) {
            window.displayAllFiles();
        }
        
        alert('Устаревшие данные удалены');
    }
}

// Инициализация
console.log('База данных инициализирована. Доступные функции:');
console.log('=== ЗАПИСИ ===');
console.log('- getAllEntries() - получить все записи');
console.log('- addEntry(entry) - добавить запись');
console.log('- updateEntry(entry) - обновить запись');
console.log('- removeEntry(id) - удалить запись');
console.log('- clearAllEntries() - очистить все записи');
console.log('=== ФАЙЛЫ ===');
console.log('- getAllFiles() - получить все файлы');
console.log('- saveFileToGlobalStorage(file) - сохранить файл');
console.log('- removeFileFromGlobalStorage(id) - удалить файл');
console.log('- clearGlobalFileStorage() - очистить все файлы');
console.log('=== УТИЛИТЫ ===');
console.log('- exportData() - экспорт всех данных в JSON');
console.log('- getStats() - получить статистику');
console.log('- searchEntries(query) - поиск записей');
console.log('- searchFiles(query) - поиск файлов');
console.log('- cleanupOldData(days) - очистить старые данные');
