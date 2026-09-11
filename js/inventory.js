// ======================================================
// NEXORA ERP - Inventory Management
// File: js/inventory.js
// ======================================================

import {
    STORAGE_KEYS,
    getAllItems,
    replaceAllItems
} from "./storage.js";

import {
    $,
    escapeHTML,
    formatDate,
    debounce,
    paginate,
    sortItems,
    matchesSearch,
    openModal,
    closeModal,
    getFormData
} from "./utils.js";

import { products as dummyProducts } from "../data/dummyData.js";
import { inventoryHistory as dummyHistory } from "../data/dummyData.js";


// ======================================================
// STATE
// ======================================================

let productList = [];
let inventoryHistory = [];

let currentPage = 1;
let itemsPerPage = 5;

let searchTerm = "";
let categoryFilter = "all";
let stockFilter = "all";

let sortField = "id";
let sortDirection = "asc";

let selectedProductId = null;


// ======================================================
// INITIALIZE DATA
// ======================================================

function initializeInventory() {

    const storedProducts =
        getAllItems(STORAGE_KEYS.products);

    const storedHistory =
        getAllItems(
            STORAGE_KEYS.inventoryHistory
        );

    if (storedProducts.length > 0) {

        productList = storedProducts;

    } else {

        productList = dummyProducts.map(
            product => ({ ...product })
        );

        replaceAllItems(
            STORAGE_KEYS.products,
            productList
        );
    }


    if (storedHistory.length > 0) {

        inventoryHistory = storedHistory;

    } else {

        inventoryHistory =
            dummyHistory.map(
                item => ({ ...item })
            );

        replaceAllItems(
            STORAGE_KEYS.inventoryHistory,
            inventoryHistory
        );
    }
}


// ======================================================
// GET ELEMENTS
// ======================================================

function getInventoryElements() {

    return {

        tableBody:
            $("#inventoryTableBody"),

        searchInput:
            $("#inventorySearch"),

        categoryFilter:
            $("#inventoryCategoryFilter"),

        stockFilter:
            $("#inventoryStockFilter"),

        sortSelect:
            $("#inventorySort"),

        itemsPerPageSelect:
            $("#inventoryItemsPerPage"),

        stockInButton:
            $("#stockInBtn"),

        stockOutButton:
            $("#stockOutBtn"),

        stockModal:
            $("#stockModal"),

        stockForm:
            $("#stockForm"),

        historyTableBody:
            $("#inventoryHistoryTableBody"),

        historyModal:
            $("#inventoryHistoryModal"),

        totalItems:
            $("#totalInventoryItems"),

        inStock:
            $("#inventoryInStock"),

        lowStock:
            $("#inventoryLowStock"),

        outOfStock:
            $("#inventoryOutOfStock"),

        totalUnits:
            $("#inventoryTotalUnits"),

        prevButton:
            $("#inventoryPrevBtn"),

        nextButton:
            $("#inventoryNextBtn"),

        paginationInfo:
            $("#inventoryPaginationInfo")
    };
}


// ======================================================
// FIND PRODUCT
// ======================================================

function findProduct(id) {

    return productList.find(
        product =>
            String(product.id) === String(id)
    );
}


// ======================================================
// GET QUANTITY
// ======================================================

function getQuantity(product) {

    return Number(
        product.quantity ??
        product.stock ??
        0
    );
}


// ======================================================
// GET STOCK STATUS
// ======================================================

function getStockStatusForProduct(product) {

    const quantity =
        getQuantity(product);


    if (quantity <= 0) {

        return "Out of Stock";
    }


    if (quantity <= 10) {

        return "Low Stock";
    }


    return "In Stock";
}


// ======================================================
// STOCK STATUS CLASS
// ======================================================

function getStatusClass(status) {

    if (status === "In Stock") {

        return "status-active";
    }


    if (status === "Low Stock") {

        return "status-warning";
    }


    if (status === "Out of Stock") {

        return "status-inactive";
    }


    return "";
}


// ======================================================
// GET FILTERED INVENTORY
// ======================================================

function getFilteredInventory() {

    let result =
        [...productList];


    // Search
    if (searchTerm) {

        result =
            result.filter(product => {

                return (

                    matchesSearch(
                        product.name,
                        searchTerm
                    ) ||

                    matchesSearch(
                        product.sku,
                        searchTerm
                    ) ||

                    matchesSearch(
                        product.category,
                        searchTerm
                    )
                );
            });
    }


    // Category
    if (categoryFilter !== "all") {

        result =
            result.filter(
                product =>
                    product.category ===
                    categoryFilter
            );
    }


    // Stock status
    if (stockFilter !== "all") {

        result =
            result.filter(product => {

                return (
                    getStockStatusForProduct(
                        product
                    ).toLowerCase() ===
                    stockFilter.toLowerCase()
                );
            });
    }


    // Sort
    result =
        sortItems(
            result,
            sortField,
            sortDirection
        );


    return result;
}


// ======================================================
// CATEGORY FILTER
// ======================================================

function renderCategoryFilter() {

    const elements =
        getInventoryElements();


    if (!elements.categoryFilter) {
        return;
    }


    const categories = [
        ...new Set(
            productList
                .map(product => product.category)
                .filter(Boolean)
        )
    ];


    elements.categoryFilter.innerHTML = `

        <option value="all">
            All Categories
        </option>

        ${categories.map(category => `

            <option value="${escapeHTML(category)}">
                ${escapeHTML(category)}
            </option>

        `).join("")}

    `;


    elements.categoryFilter.value =
        categoryFilter;
}


// ======================================================
// RENDER INVENTORY TABLE
// ======================================================

function renderInventoryTable() {

    const elements =
        getInventoryElements();


    if (!elements.tableBody) {
        return;
    }


    const filteredInventory =
        getFilteredInventory();


    const pagination =
        paginate(
            filteredInventory,
            currentPage,
            itemsPerPage
        );


    if (pagination.items.length === 0) {

        elements.tableBody.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="empty-state"
                >

                    <div>

                        <i class="fas fa-boxes"></i>

                        <h3>
                            No inventory found
                        </h3>

                        <p>
                            Try changing your
                            search or filter.
                        </p>

                    </div>

                </td>

            </tr>

        `;

        updatePagination(pagination);

        return;
    }


    elements.tableBody.innerHTML =
        pagination.items.map(product => {

            const quantity =
                getQuantity(product);


            const status =
                getStockStatusForProduct(
                    product
                );


            const statusClass =
                getStatusClass(status);


            return `

                <tr
                    data-id="${product.id}"
                >

                    <td>

                        <strong>
                            #${product.id}
                        </strong>

                    </td>


                    <td>

                        <div
                            class="product-info"
                        >

                            <div
                                class="product-image"
                            >

                                ${
                                    product.image

                                    ? `

                                        <img
                                            src="${escapeHTML(
                                                product.image
                                            )}"
                                            alt="${escapeHTML(
                                                product.name
                                            )}"
                                        >

                                      `

                                    : `

                                        <i
                                            class="fas fa-box"
                                        ></i>

                                      `
                                }

                            </div>


                            <div>

                                <strong>
                                    ${escapeHTML(
                                        product.name
                                    )}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        product.sku ||
                                        "No SKU"
                                    )}
                                </small>

                            </div>

                        </div>

                    </td>


                    <td>

                        ${escapeHTML(
                            product.category ||
                            "-"
                        )}

                    </td>


                    <td>

                        <strong>
                            ${quantity}
                        </strong>

                    </td>


                    <td>

                        <span
                            class="status-badge ${statusClass}"
                        >
                            ${status}
                        </span>

                    </td>


                    <td>

                        ${formatDate(
                            product.updatedAt ||
                            product.createdAt
                        )}

                    </td>


                    <td>

                        <div
                            class="table-actions"
                        >

                            <button
                                class="btn-icon inventory-stock-in"
                                data-id="${product.id}"
                                title="Stock In"
                            >

                                <i
                                    class="fas fa-plus"
                                ></i>

                            </button>


                            <button
                                class="btn-icon inventory-stock-out"
                                data-id="${product.id}"
                                title="Stock Out"
                            >

                                <i
                                    class="fas fa-minus"
                                ></i>

                            </button>


                            <button
                                class="btn-icon inventory-history"
                                data-id="${product.id}"
                                title="View History"
                            >

                                <i
                                    class="fas fa-history"
                                ></i>

                            </button>

                        </div>

                    </td>

                </tr>

            `;

        }).join("");


    updatePagination(pagination);
}


// ======================================================
// UPDATE STATISTICS
// ======================================================

function updateInventoryStats() {

    const elements =
        getInventoryElements();


    const totalItems =
        productList.length;


    const inStock =
        productList.filter(
            product =>
                getStockStatusForProduct(
                    product
                ) === "In Stock"
        ).length;


    const lowStock =
        productList.filter(
            product =>
                getStockStatusForProduct(
                    product
                ) === "Low Stock"
        ).length;


    const outOfStock =
        productList.filter(
            product =>
                getStockStatusForProduct(
                    product
                ) === "Out of Stock"
        ).length;


    const totalUnits =
        productList.reduce(
            (sum, product) =>
                sum +
                getQuantity(product),
            0
        );


    if (elements.totalItems) {

        elements.totalItems.textContent =
            totalItems;
    }


    if (elements.inStock) {

        elements.inStock.textContent =
            inStock;
    }


    if (elements.lowStock) {

        elements.lowStock.textContent =
            lowStock;
    }


    if (elements.outOfStock) {

        elements.outOfStock.textContent =
            outOfStock;
    }


    if (elements.totalUnits) {

        elements.totalUnits.textContent =
            totalUnits;
    }
}


// ======================================================
// PAGINATION
// ======================================================

function updatePagination(pagination) {

    const elements =
        getInventoryElements();


    if (elements.paginationInfo) {

        if (
            pagination.totalItems === 0
        ) {

            elements.paginationInfo.textContent =
                "0 items";

        } else {

            const start =
                (pagination.currentPage - 1) *
                pagination.itemsPerPage +
                1;


            const end =
                Math.min(
                    pagination.currentPage *
                    pagination.itemsPerPage,
                    pagination.totalItems
                );


            elements.paginationInfo.textContent =
                `${start}-${end} of ${pagination.totalItems}`;
        }
    }


    if (elements.prevButton) {

        elements.prevButton.disabled =
            pagination.currentPage <= 1;
    }


    if (elements.nextButton) {

        elements.nextButton.disabled =
            pagination.currentPage >=
            pagination.totalPages;
    }


    renderPageNumbers(pagination);
}


// ======================================================
// PAGE NUMBERS
// ======================================================

function renderPageNumbers(pagination) {

    const container =
        $("#inventoryPaginationNumbers");


    if (!container) {
        return;
    }


    if (pagination.totalPages <= 1) {

        container.innerHTML = "";

        return;
    }


    let html = "";


    for (
        let i = 1;
        i <= pagination.totalPages;
        i++
    ) {

        html += `

            <button
                class="pagination-number ${
                    i === pagination.currentPage
                        ? "active"
                        : ""
                }"
                data-page="${i}"
            >
                ${i}
            </button>

        `;
    }


    container.innerHTML =
        html;
}


// ======================================================
// OPEN STOCK IN
// ======================================================

function openStockInModal(id = null) {

    const elements =
        getInventoryElements();


    selectedProductId =
        id !== null
            ? id
            : null;


    if (
        elements.stockForm
    ) {

        elements.stockForm.reset();
    }


    const title =
        $("#stockModalTitle");


    if (title) {

        title.textContent =
            "Stock In";
    }


    const typeField =
        document.querySelector(
            '[name="stockType"]'
        );


    if (typeField) {

        typeField.value =
            "in";
    }


    populateStockProductSelect();


    const productSelect =
        document.querySelector(
            '[name="productId"]'
        );


    if (
        productSelect &&
        id !== null
    ) {

        productSelect.value =
            String(id);
    }


    if (elements.stockModal) {

        openModal(
            elements.stockModal
        );
    }
}


// ======================================================
// OPEN STOCK OUT
// ======================================================

function openStockOutModal(id = null) {

    const elements =
        getInventoryElements();


    selectedProductId =
        id !== null
            ? id
            : null;


    if (
        elements.stockForm
    ) {

        elements.stockForm.reset();
    }


    const title =
        $("#stockModalTitle");


    if (title) {

        title.textContent =
            "Stock Out";
    }


    const typeField =
        document.querySelector(
            '[name="stockType"]'
        );


    if (typeField) {

        typeField.value =
            "out";
    }


    populateStockProductSelect();


    const productSelect =
        document.querySelector(
            '[name="productId"]'
        );


    if (
        productSelect &&
        id !== null
    ) {

        productSelect.value =
            String(id);
    }


    if (elements.stockModal) {

        openModal(
            elements.stockModal
        );
    }
}


// ======================================================
// PRODUCT SELECT
// ======================================================

function populateStockProductSelect() {

    const select =
        document.querySelector(
            '[name="productId"]'
        );


    if (!select) {
        return;
    }


    select.innerHTML = `

        <option value="">
            Select Product
        </option>

        ${productList.map(product => `

            <option
                value="${product.id}"
            >

                ${escapeHTML(
                    product.name
                )}

                ${
                    product.sku
                        ? ` - ${escapeHTML(
                            product.sku
                        )}`
                        : ""
                }

            </option>

        `).join("")}

    `;
}


// ======================================================
// SAVE STOCK TRANSACTION
// ======================================================

function saveStockTransaction(event) {

    event.preventDefault();


    const form =
        $("#stockForm");


    if (!form) {
        return;
    }


    const data =
        getFormData(form);


    const productId =
        data.productId;


    const type =
        data.stockType ||
        data.type ||
        "in";


    const quantity =
        Number(
            data.quantity || 0
        );


    const reason =
        String(
            data.reason || ""
        ).trim();


    if (!productId) {

        showInventoryMessage(
            "Please select a product.",
            "error"
        );

        return;
    }


    if (
        !quantity ||
        quantity <= 0
    ) {

        showInventoryMessage(
            "Please enter a valid quantity.",
            "error"
        );

        return;
    }


    const product =
        findProduct(productId);


    if (!product) {

        showInventoryMessage(
            "Product not found.",
            "error"
        );

        return;
    }


    const oldQuantity =
        getQuantity(product);


    let newQuantity =
        oldQuantity;


    if (type === "out") {

        if (quantity > oldQuantity) {

            showInventoryMessage(
                `Not enough stock. Available: ${oldQuantity}`,
                "error"
            );

            return;
        }


        newQuantity =
            oldQuantity - quantity;

    } else {

        newQuantity =
            oldQuantity + quantity;
    }


    // Update product
    const updatedProduct = {

        ...product,

        quantity:
            newQuantity,

        stock:
            newQuantity,

        updatedAt:
            new Date().toISOString()
    };


    productList =
        productList.map(
            item =>
                String(item.id) ===
                String(productId)
                    ? updatedProduct
                    : item
        );


    replaceAllItems(
        STORAGE_KEYS.products,
        productList
    );


    // Add history
    const historyEntry = {

        id:
            getNextHistoryId(),

        productId:
            product.id,

        productName:
            product.name,

        type:
            type === "out"
                ? "Stock Out"
                : "Stock In",

        quantity:
            quantity,

        previousQuantity:
            oldQuantity,

        newQuantity:
            newQuantity,

        reason:
            reason ||
            (
                type === "out"
                    ? "Stock removed"
                    : "Stock added"
            ),

        date:
            new Date().toISOString()
    };


    inventoryHistory.unshift(
        historyEntry
    );


    replaceAllItems(
        STORAGE_KEYS.inventoryHistory,
        inventoryHistory
    );


    showInventoryMessage(
        `Stock ${
            type === "out"
                ? "out"
                : "in"
        } completed successfully.`,
        "success"
    );


    closeStockModal();


    renderInventoryTable();

    updateInventoryStats();
}


// ======================================================
// HISTORY ID
// ======================================================

function getNextHistoryId() {

    if (
        inventoryHistory.length === 0
    ) {

        return 1;
    }


    const ids =
        inventoryHistory
            .map(item =>
                Number(item.id) || 0
            );


    return (
        Math.max(...ids) + 1
    );
}


// ======================================================
// CLOSE STOCK MODAL
// ======================================================

function closeStockModal() {

    const modal =
        $("#stockModal");


    if (modal) {

        closeModal(modal);
    }


    selectedProductId =
        null;
}


// ======================================================
// VIEW PRODUCT HISTORY
// ======================================================

function openInventoryHistory(id) {

    const product =
        findProduct(id);


    const modal =
        $("#inventoryHistoryModal");


    if (
        !product ||
        !modal
    ) {
        return;
    }


    const content =
        $("#inventoryHistoryContent");


    if (!content) {
        return;
    }


    const history =
        inventoryHistory.filter(
            item =>
                String(item.productId) ===
                String(id)
        );


    if (history.length === 0) {

        content.innerHTML = `

            <div class="empty-state">

                <i
                    class="fas fa-history"
                ></i>

                <h3>
                    No history found
                </h3>

                <p>
                    No stock movement has
                    been recorded for this product.
                </p>

            </div>

        `;

        openModal(modal);

        return;
    }


    content.innerHTML = `

        <div class="history-product-header">

            <div>

                <h2>
                    ${escapeHTML(
                        product.name
                    )}
                </h2>

                <p>
                    Current Stock:
                    <strong>
                        ${getQuantity(product)}
                    </strong>
                </p>

            </div>

        </div>


        <div class="inventory-history-list">

            ${history.map(item => {

                const isStockIn =
                    item.type ===
                    "Stock In";


                return `

                    <div
                        class="inventory-history-item"
                    >

                        <div
                            class="history-icon ${
                                isStockIn
                                    ? "history-in"
                                    : "history-out"
                            }"
                        >

                            <i
                                class="fas ${
                                    isStockIn
                                        ? "fa-arrow-down"
                                        : "fa-arrow-up"
                                }"
                            ></i>

                        </div>


                        <div
                            class="history-content"
                        >

                            <strong>
                                ${item.type}
                            </strong>

                            <p>
                                Quantity:
                                ${item.quantity}
                            </p>

                            <small>
                                ${
                                    escapeHTML(
                                        item.reason ||
                                        "-"
                                    )
                                }
                            </small>

                        </div>


                        <div
                            class="history-meta"
                        >

                            <strong>
                                ${
                                    isStockIn
                                        ? "+"
                                        : "-"
                                }${item.quantity}
                            </strong>

                            <small>
                                ${formatDate(
                                    item.date
                                )}
                            </small>

                        </div>

                    </div>

                `;

            }).join("")}

        </div>
    `;


    openModal(modal);
}


// ======================================================
// RENDER ALL HISTORY TABLE
// ======================================================

function renderHistoryTable() {

    const elements =
        getInventoryElements();


    if (
        !elements.historyTableBody
    ) {
        return;
    }


    if (
        inventoryHistory.length === 0
    ) {

        elements.historyTableBody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    class="empty-state"
                >

                    No inventory history found.

                </td>

            </tr>

        `;

        return;
    }


    elements.historyTableBody.innerHTML =
        inventoryHistory.map(item => {

            const isStockIn =
                item.type === "Stock In";


            return `

                <tr>

                    <td>
                        #${item.id}
                    </td>

                    <td>
                        ${escapeHTML(
                            item.productName ||
                            "-"
                        )}
                    </td>

                    <td>

                        <span
                            class="status-badge ${
                                isStockIn
                                    ? "status-active"
                                    : "status-inactive"
                            }"
                        >

                            ${item.type}

                        </span>

                    </td>

                    <td>

                        <strong>
                            ${
                                isStockIn
                                    ? "+"
                                    : "-"
                            }${item.quantity}
                        </strong>

                    </td>

                    <td>
                        ${item.previousQuantity}
                    </td>

                    <td>
                        ${item.newQuantity}
                    </td>

                    <td>
                        ${formatDate(
                            item.date
                        )}
                    </td>

                </tr>

            `;

        }).join("");
}


// ======================================================
// SHOW MESSAGE
// ======================================================

function showInventoryMessage(
    message,
    type = "success"
) {

    if (
        typeof window.showToast ===
        "function"
    ) {

        window.showToast(
            message,
            type
        );

        return;
    }


    const container =
        $("#toastContainer");


    if (!container) {

        console.log(
            `[${type}] ${message}`
        );

        return;
    }


    const toast =
        document.createElement(
            "div"
        );


    toast.className =
        `toast toast-${type}`;


    toast.innerHTML = `

        <span>
            ${escapeHTML(message)}
        </span>

        <button type="button">
            &times;
        </button>

    `;


    container.appendChild(
        toast
    );


    setTimeout(
        () => toast.remove(),
        3000
    );
}


// ======================================================
// SEARCH
// ======================================================

const handleInventorySearch =
    debounce(
        value => {

            searchTerm =
                value
                    .trim()
                    .toLowerCase();


            currentPage = 1;


            renderInventoryTable();

        },
        300
    );


// ======================================================
// EVENT LISTENERS
// ======================================================

function initializeInventoryEvents() {

    const elements =
        getInventoryElements();


    // Stock In
    if (elements.stockInButton) {

        elements.stockInButton.addEventListener(
            "click",
            () => openStockInModal()
        );
    }


    // Stock Out
    if (elements.stockOutButton) {

        elements.stockOutButton.addEventListener(
            "click",
            () => openStockOutModal()
        );
    }


    // Search
    if (elements.searchInput) {

        elements.searchInput.addEventListener(
            "input",
            event => {

                handleInventorySearch(
                    event.target.value
                );
            }
        );
    }


    // Category
    if (elements.categoryFilter) {

        elements.categoryFilter.addEventListener(
            "change",
            event => {

                categoryFilter =
                    event.target.value;

                currentPage = 1;

                renderInventoryTable();
            }
        );
    }


    // Stock filter
    if (elements.stockFilter) {

        elements.stockFilter.addEventListener(
            "change",
            event => {

                stockFilter =
                    event.target.value;

                currentPage = 1;

                renderInventoryTable();
            }
        );
    }


    // Sort
    if (elements.sortSelect) {

        elements.sortSelect.addEventListener(
            "change",
            event => {

                const value =
                    event.target.value;


                if (
                    value.includes("-desc")
                ) {

                    sortField =
                        value.replace(
                            "-desc",
                            ""
                        );

                    sortDirection =
                        "desc";

                } else {

                    sortField =
                        value.replace(
                            "-asc",
                            ""
                        );

                    sortDirection =
                        "asc";
                }


                currentPage = 1;

                renderInventoryTable();
            }
        );
    }


    // Items per page
    if (
        elements.itemsPerPageSelect
    ) {

        elements.itemsPerPageSelect.addEventListener(
            "change",
            event => {

                itemsPerPage =
                    Number(
                        event.target.value
                    ) || 5;


                currentPage = 1;


                renderInventoryTable();
            }
        );
    }


    // Previous
    if (elements.prevButton) {

        elements.prevButton.addEventListener(
            "click",
            () => {

                if (
                    currentPage > 1
                ) {

                    currentPage--;

                    renderInventoryTable();
                }
            }
        );
    }


    // Next
    if (elements.nextButton) {

        elements.nextButton.addEventListener(
            "click",
            () => {

                const total =
                    getFilteredInventory()
                        .length;


                const totalPages =
                    Math.ceil(
                        total /
                        itemsPerPage
                    );


                if (
                    currentPage <
                    totalPages
                ) {

                    currentPage++;

                    renderInventoryTable();
                }
            }
        );
    }


    // Inventory table actions
    if (elements.tableBody) {

        elements.tableBody.addEventListener(
            "click",
            event => {

                const stockIn =
                    event.target.closest(
                        ".inventory-stock-in"
                    );


                const stockOut =
                    event.target.closest(
                        ".inventory-stock-out"
                    );


                const history =
                    event.target.closest(
                        ".inventory-history"
                    );


                if (stockIn) {

                    openStockInModal(
                        stockIn.dataset.id
                    );

                    return;
                }


                if (stockOut) {

                    openStockOutModal(
                        stockOut.dataset.id
                    );

                    return;
                }


                if (history) {

                    openInventoryHistory(
                        history.dataset.id
                    );

                    return;
                }
            }
        );
    }


    // Stock form
    if (elements.stockForm) {

        elements.stockForm.addEventListener(
            "submit",
            saveStockTransaction
        );
    }


    // Pagination
    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "#inventoryPaginationNumbers .pagination-number"
                );


            if (!button) {
                return;
            }


            const page =
                Number(
                    button.dataset.page
                );


            if (page) {

                currentPage =
                    page;

                renderInventoryTable();
            }
        }
    );


    // Close modal
    document.addEventListener(
        "click",
        event => {

            const closeButton =
                event.target.closest(
                    "[data-close-modal]"
                );


            if (!closeButton) {
                return;
            }


            const modalId =
                closeButton.dataset.closeModal;


            const modal =
                document.getElementById(
                    modalId
                );


            if (modal) {

                closeModal(modal);
            }
        }
    );


    // ESC
    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key !== "Escape"
            ) {
                return;
            }


            closeStockModal();


            const historyModal =
                $("#inventoryHistoryModal");


            if (historyModal) {

                closeModal(
                    historyModal
                );
            }
        }
    );
}


// ======================================================
// INITIALIZE INVENTORY PAGE
// ======================================================

export function initInventory() {

    if (!$("#inventoryTableBody")) {
        return;
    }


    initializeInventory();

    renderCategoryFilter();

    updateInventoryStats();

    renderInventoryTable();

    renderHistoryTable();

    initializeInventoryEvents();


    console.log(
        "NEXORA ERP: Inventory Management initialized."
    );
}


// ======================================================
// EXPORTS
// ======================================================

export {
    initializeInventory,
    getFilteredInventory,
    renderInventoryTable,
    renderHistoryTable,
    updateInventoryStats,
    openStockInModal,
    openStockOutModal,
    openInventoryHistory,
    saveStockTransaction,
    getStockStatusForProduct
};


// ======================================================
// AUTO INITIALIZE
// ======================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initInventory
    );

} else {

    initInventory();
}