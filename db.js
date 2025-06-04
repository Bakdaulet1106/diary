// Простая база данных используя localStorage

// Ключ для хранения записей в localStorage
const ENTRIES_KEY = 'diary_entries';

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

// Экспорт данных в JSON
function exportData() {
    const entries = getAllEntries();
    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `diary_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Импорт данных из JSON
function importData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedEntries = JSON.parse(e.target.result);
            if (Array.isArray(importedEntries)) {
                if (confirm(`Импортировать ${importedEntries.length} записей? Это заменит все текущие записи.`)) {
                    saveAllEntries(importedEntries);
                    window.entries = importedEntries;
                    if (window.displayEntries) {
                        window.displayEntries();
                    }
                    alert('Данные успешно импортированы!');
                }
            } else {
                alert('Неверный формат файла');
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
    const themes = {};
    let totalWords = 0;
    
    entries.forEach(entry => {
        // Подсчет тем
        themes[entry.theme] = (themes[entry.theme] || 0) + 1;
        
        // Подсчет слов (примерный)
        const text = entry.content.replace(/<[^>]*>/g, '');
        totalWords += text.split(/\s+/).filter(word => word.length > 0).length;
    });
    
    return {
        totalEntries: entries.length,
        totalWords: totalWords,
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

// Инициализация
console.log('База данных инициализирована. Доступные функции:');
console.log('- getAllEntries() - получить все записи');
console.log('- addEntry(entry) - добавить запись');
console.log('- updateEntry(entry) - обновить запись');
console.log('- removeEntry(id) - удалить запись');
console.log('- exportData() - экспорт в JSON');
console.log('- clearAllEntries() - очистить все записи');
console.log('- getStats() - получить статистику');
console.log('- searchEntries(query) - поиск записей');
