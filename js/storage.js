/* =========================================================
   NEXORA ERP
   STORAGE MODULE
   LocalStorage / SessionStorage Management
   ========================================================= */


/* =========================================================
   STORAGE KEYS
   ========================================================= */

export const STORAGE_KEYS = {
    employees: "nexora_employees",
    customers: "nexora_customers",
    products: "nexora_products",
    sales: "nexora_sales",
    expenses: "nexora_expenses",
    notifications: "nexora_notifications",
    inventoryHistory: "nexora_inventory_history",
    currentUser: "nexora_current_user",
    users: "nexora_users",
    theme: "nexora_theme"
};


/* =========================================================
   SAVE DATA
   ========================================================= */

export function saveData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));

        return true;
    } catch (error) {
        console.error("Failed to save data:", error);

        return false;
    }
}


/* =========================================================
   GET DATA
   ========================================================= */

export function getData(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);

        if (data === null) {
            return defaultValue;
        }

        return JSON.parse(data);

    } catch (error) {
        console.error("Failed to get data:", error);

        return defaultValue;
    }
}


/* =========================================================
   REMOVE DATA
   ========================================================= */

export function removeData(key) {
    try {
        localStorage.removeItem(key);

        return true;
    } catch (error) {
        console.error("Failed to remove data:", error);

        return false;
    }
}


/* =========================================================
   CLEAR ALL NEXORA DATA
   ========================================================= */

export function clearNexoraData() {
    try {
        Object.values(STORAGE_KEYS).forEach((key) => {
            localStorage.removeItem(key);
        });

        return true;

    } catch (error) {
        console.error("Failed to clear NEXORA data:", error);

        return false;
    }
}


/* =========================================================
   CHECK DATA EXISTS
   ========================================================= */

export function hasData(key) {
    return localStorage.getItem(key) !== null;
}


/* =========================================================
   UPDATE DATA
   ========================================================= */

export function updateData(key, newData) {
    return saveData(key, newData);
}


/* =========================================================
   SESSION STORAGE
   ========================================================= */

export function saveSession(key, data) {
    try {
        sessionStorage.setItem(key, JSON.stringify(data));

        return true;

    } catch (error) {
        console.error("Failed to save session data:", error);

        return false;
    }
}


export function getSession(key, defaultValue = null) {
    try {
        const data = sessionStorage.getItem(key);

        if (data === null) {
            return defaultValue;
        }

        return JSON.parse(data);

    } catch (error) {
        console.error("Failed to get session data:", error);

        return defaultValue;
    }
}


export function removeSession(key) {
    try {
        sessionStorage.removeItem(key);

        return true;

    } catch (error) {
        console.error("Failed to remove session data:", error);

        return false;
    }
}


/* =========================================================
   INITIALIZE DEMO DATA
   ========================================================= */

export function initializeData(key, defaultData) {

    if (!hasData(key)) {
        saveData(key, defaultData);
        return defaultData;
    }

    return getData(key, defaultData);
}


/* =========================================================
   GET NEXT ID
   ========================================================= */

export function getNextId(data = []) {

    if (!Array.isArray(data) || data.length === 0) {
        return 1;
    }

    const ids = data
        .map(item => Number(item.id))
        .filter(id => !Number.isNaN(id));

    if (ids.length === 0) {
        return 1;
    }

    return Math.max(...ids) + 1;
}


/* =========================================================
   ADD ITEM
   ========================================================= */

export function addItem(key, item) {

    const existingData = getData(key, []);

    if (!Array.isArray(existingData)) {
        console.error(`Data stored at "${key}" is not an array.`);
        return null;
    }

    const newItem = {
        id: item.id ?? getNextId(existingData),
        ...item
    };

    existingData.push(newItem);

    const saved = saveData(key, existingData);

    if (!saved) {
        return null;
    }

    return newItem;
}


/* =========================================================
   FIND ITEM BY ID
   ========================================================= */

export function findItemById(key, id) {

    const data = getData(key, []);

    if (!Array.isArray(data)) {
        return null;
    }

    return data.find(item => Number(item.id) === Number(id)) || null;
}


/* =========================================================
   UPDATE ITEM BY ID
   ========================================================= */

export function updateItem(key, id, updatedItem) {

    const data = getData(key, []);

    if (!Array.isArray(data)) {
        return null;
    }

    const index = data.findIndex(
        item => Number(item.id) === Number(id)
    );

    if (index === -1) {
        return null;
    }

    data[index] = {
        ...data[index],
        ...updatedItem,
        id: data[index].id
    };

    const saved = saveData(key, data);

    if (!saved) {
        return null;
    }

    return data[index];
}


/* =========================================================
   DELETE ITEM BY ID
   ========================================================= */

export function deleteItem(key, id) {

    const data = getData(key, []);

    if (!Array.isArray(data)) {
        return false;
    }

    const filteredData = data.filter(
        item => Number(item.id) !== Number(id)
    );

    if (filteredData.length === data.length) {
        return false;
    }

    return saveData(key, filteredData);
}


/* =========================================================
   GET ALL ITEMS
   ========================================================= */

export function getAllItems(key) {

    const data = getData(key, []);

    if (!Array.isArray(data)) {
        return [];
    }

    return data;
}


/* =========================================================
   REPLACE ALL ITEMS
   ========================================================= */

export function replaceAllItems(key, data) {

    if (!Array.isArray(data)) {
        console.error("replaceAllItems expects an array.");
        return false;
    }

    return saveData(key, data);
}


/* =========================================================
   STORAGE SIZE INFO
   ========================================================= */

export function getStorageInfo() {

    let totalCharacters = 0;

    for (let i = 0; i < localStorage.length; i++) {

        const key = localStorage.key(i);
        const value = localStorage.getItem(key);

        totalCharacters += key.length;
        totalCharacters += value.length;
    }

    return {
        keys: localStorage.length,
        characters: totalCharacters
    };
}