/* =========================================================
   NEXORA ERP
   UTILITY FUNCTIONS
   Reusable JavaScript Functions
   ========================================================= */


/* =========================================================
   ELEMENT SELECTORS
   ========================================================= */

/**
 * Select a single element
 */
export function $(selector, parent = document) {
    return parent.querySelector(selector);
}


/**
 * Select multiple elements
 */
export function $$(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
}


/* =========================================================
   TEXT HELPERS
   ========================================================= */

/**
 * Escape HTML characters
 * Prevents unwanted HTML injection
 */
export function escapeHTML(value = "") {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/**
 * Capitalize first letter
 */
export function capitalize(value = "") {

    if (!value) {
        return "";
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
}


/**
 * Convert text to Title Case
 */
export function titleCase(value = "") {

    return String(value)
        .toLowerCase()
        .split(" ")
        .filter(Boolean)
        .map(word => capitalize(word))
        .join(" ");
}


/* =========================================================
   NUMBER HELPERS
   ========================================================= */

/**
 * Convert value to number safely
 */
export function toNumber(value, defaultValue = 0) {

    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : defaultValue;
}


/**
 * Format number with commas
 */
export function formatNumber(value, decimals = 0) {

    const number = toNumber(value);

    return number.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}


/**
 * Format currency
 */
export function formatCurrency(
    value,
    currency = "৳",
    decimals = 2
) {

    const number = toNumber(value);

    return `${currency}${number.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    })}`;
}


/**
 * Calculate percentage
 */
export function calculatePercentage(value, total) {

    const currentValue = toNumber(value);
    const totalValue = toNumber(total);

    if (totalValue === 0) {
        return 0;
    }

    return (currentValue / totalValue) * 100;
}


/**
 * Round number
 */
export function roundNumber(value, decimals = 2) {

    const number = toNumber(value);
    const multiplier = 10 ** decimals;

    return Math.round(number * multiplier) / multiplier;
}


/* =========================================================
   DATE HELPERS
   ========================================================= */

/**
 * Get today's date
 * Format: YYYY-MM-DD
 */
export function getToday() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/**
 * Format date
 * Example:
 * 2026-09-11 → Sep 11, 2026
 */
export function formatDate(dateValue) {

    if (!dateValue) {
        return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}


/**
 * Format date and time
 */
export function formatDateTime(dateValue) {

    if (!dateValue) {
        return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}


/* =========================================================
   ID GENERATORS
   ========================================================= */

/**
 * Generate random ID
 */
export function generateId(prefix = "ID") {

    const timestamp = Date.now();

    const random = Math.floor(
        Math.random() * 1000
    );

    return `${prefix}-${timestamp}-${random}`;
}


/**
 * Generate formatted document number
 */
export function generateDocumentNumber(
    prefix = "DOC",
    number = 1
) {

    return `${prefix}-${String(number).padStart(4, "0")}`;
}


/* =========================================================
   SEARCH
   ========================================================= */

/**
 * Check whether object contains search text
 */
export function matchesSearch(item, searchTerm, fields = []) {

    if (!searchTerm) {
        return true;
    }

    const search = String(searchTerm)
        .toLowerCase()
        .trim();

    return fields.some(field => {

        const value = item[field];

        if (value === undefined || value === null) {
            return false;
        }

        return String(value)
            .toLowerCase()
            .includes(search);
    });
}


/**
 * Filter array by search term
 */
export function searchItems(
    items = [],
    searchTerm = "",
    fields = []
) {

    if (!Array.isArray(items)) {
        return [];
    }

    if (!searchTerm.trim()) {
        return [...items];
    }

    return items.filter(item =>
        matchesSearch(item, searchTerm, fields)
    );
}


/* =========================================================
   SORTING
   ========================================================= */

/**
 * Sort array
 *
 * direction:
 * "asc"  = ascending
 * "desc" = descending
 */
export function sortItems(
    items = [],
    field,
    direction = "asc"
) {

    if (!Array.isArray(items)) {
        return [];
    }

    const sortedItems = [...items];

    sortedItems.sort((a, b) => {

        let valueA = a[field];
        let valueB = b[field];

        if (
            typeof valueA === "string" &&
            typeof valueB === "string"
        ) {

            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
        }

        if (valueA < valueB) {
            return direction === "asc" ? -1 : 1;
        }

        if (valueA > valueB) {
            return direction === "asc" ? 1 : -1;
        }

        return 0;
    });

    return sortedItems;
}


/* =========================================================
   PAGINATION
   ========================================================= */

/**
 * Get paginated items
 */
export function paginate(
    items = [],
    currentPage = 1,
    itemsPerPage = 10
) {

    if (!Array.isArray(items)) {
        return {
            items: [],
            totalItems: 0,
            totalPages: 0,
            currentPage: 1
        };
    }

    const totalItems = items.length;

    const totalPages = Math.ceil(
        totalItems / itemsPerPage
    );

    const safePage = Math.min(
        Math.max(1, currentPage),
        Math.max(1, totalPages)
    );

    const startIndex =
        (safePage - 1) * itemsPerPage;

    const endIndex =
        startIndex + itemsPerPage;

    return {
        items: items.slice(startIndex, endIndex),
        totalItems,
        totalPages,
        currentPage: safePage,
        startIndex,
        endIndex
    };
}


/* =========================================================
   DEBOUNCE
   ========================================================= */

/**
 * Delay function execution
 *
 * Useful for search boxes
 */
export function debounce(
    callback,
    delay = 300
) {

    let timeoutId;

    return function (...args) {

        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            callback.apply(this, args);
        }, delay);
    };
}


/* =========================================================
   DOM HELPERS
   ========================================================= */

/**
 * Show element
 */
export function showElement(element) {

    if (!element) {
        return;
    }

    element.style.display = "";
}


/**
 * Hide element
 */
export function hideElement(element) {

    if (!element) {
        return;
    }

    element.style.display = "none";
}


/**
 * Toggle element visibility
 */
export function toggleElement(element) {

    if (!element) {
        return;
    }

    const isHidden =
        window.getComputedStyle(element).display === "none";

    element.style.display = isHidden ? "" : "none";
}


/**
 * Add class safely
 */
export function addClass(element, className) {

    if (!element) {
        return;
    }

    element.classList.add(className);
}


/**
 * Remove class safely
 */
export function removeClass(element, className) {

    if (!element) {
        return;
    }

    element.classList.remove(className);
}


/**
 * Toggle class
 */
export function toggleClass(element, className) {

    if (!element) {
        return false;
    }

    return element.classList.toggle(className);
}


/* =========================================================
   MODAL HELPERS
   ========================================================= */

/**
 * Open modal
 */
export function openModal(modal) {

    if (!modal) {
        return;
    }

    modal.classList.add("show");

    document.body.classList.add("modal-open");
}


/**
 * Close modal
 */
export function closeModal(modal) {

    if (!modal) {
        return;
    }

    modal.classList.remove("show");

    document.body.classList.remove("modal-open");
}


/**
 * Close all modals
 */
export function closeAllModals() {

    const modals = document.querySelectorAll(".modal");

    modals.forEach(modal => {
        modal.classList.remove("show");
    });

    document.body.classList.remove("modal-open");
}


/* =========================================================
   FORM HELPERS
   ========================================================= */

/**
 * Reset form
 */
export function resetForm(form) {

    if (!form) {
        return;
    }

    form.reset();

    const messages =
        form.querySelectorAll(
            ".form-message, .auth-message"
        );

    messages.forEach(message => {
        message.textContent = "";
        message.classList.remove(
            "show",
            "error",
            "success",
            "warning"
        );
    });
}


/**
 * Get form data as object
 */
export function getFormData(form) {

    if (!form) {
        return {};
    }

    const formData = new FormData(form);

    return Object.fromEntries(formData.entries());
}


/* =========================================================
   VALIDATION
   ========================================================= */

/**
 * Validate email
 */
export function isValidEmail(email) {

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(
        String(email).trim()
    );
}


/**
 * Validate phone number
 */
export function isValidPhone(phone) {

    const phonePattern =
        /^[+]?[0-9\s-]{7,20}$/;

    return phonePattern.test(
        String(phone).trim()
    );
}


/**
 * Check required value
 */
export function isRequired(value) {

    return (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
    );
}


/* =========================================================
   STOCK HELPERS
   ========================================================= */

/**
 * Get product stock status
 */
export function getStockStatus(
    quantity,
    minimumStock
) {

    const stock = toNumber(quantity);
    const minimum = toNumber(minimumStock);

    if (stock <= 0) {
        return "Out of Stock";
    }

    if (stock <= minimum) {
        return "Low Stock";
    }

    return "In Stock";
}


/* =========================================================
   ARRAY HELPERS
   ========================================================= */

/**
 * Remove duplicate values
 */
export function uniqueArray(array = []) {

    if (!Array.isArray(array)) {
        return [];
    }

    return [...new Set(array)];
}


/**
 * Find item by ID
 */
export function findById(items = [], id) {

    if (!Array.isArray(items)) {
        return null;
    }

    return items.find(
        item => Number(item.id) === Number(id)
    ) || null;
}


/* =========================================================
   ASYNC HELPERS
   ========================================================= */

/**
 * Wait for specified milliseconds
 */
export function wait(milliseconds = 500) {

    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}


/* =========================================================
   SAFE JSON
   ========================================================= */

/**
 * Parse JSON safely
 */
export function parseJSON(
    json,
    defaultValue = null
) {

    try {
        return JSON.parse(json);
    } catch (error) {
        console.error("Invalid JSON:", error);

        return defaultValue;
    }
}


/* =========================================================
   CLAMP NUMBER
   ========================================================= */

export function clamp(
    value,
    minimum,
    maximum
) {

    return Math.min(
        Math.max(
            toNumber(value),
            minimum
        ),
        maximum
    );
}


/* =========================================================
   EXPORT DEFAULT OBJECT
   ========================================================= */

export default {
    $,
    $$,
    escapeHTML,
    capitalize,
    titleCase,
    toNumber,
    formatNumber,
    formatCurrency,
    calculatePercentage,
    roundNumber,
    getToday,
    formatDate,
    formatDateTime,
    generateId,
    generateDocumentNumber,
    matchesSearch,
    searchItems,
    sortItems,
    paginate,
    debounce,
    showElement,
    hideElement,
    toggleElement,
    addClass,
    removeClass,
    toggleClass,
    openModal,
    closeModal,
    closeAllModals,
    resetForm,
    getFormData,
    isValidEmail,
    isValidPhone,
    isRequired,
    getStockStatus,
    uniqueArray,
    findById,
    wait,
    parseJSON,
    clamp
};