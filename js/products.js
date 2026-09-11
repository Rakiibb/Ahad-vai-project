// ======================================================
// NEXORA ERP - Product Management
// File: js/products.js
// ======================================================

import {
    STORAGE_KEYS,
    getAllItems,
    replaceAllItems,
    getNextId
} from "./storage.js";

import {
    $,
    escapeHTML,
    formatCurrency,
    formatDate,
    debounce,
    paginate,
    sortItems,
    matchesSearch,
    openModal,
    closeModal,
    resetForm,
    getFormData,
    isRequired,
    toNumber,
    getStockStatus
} from "./utils.js";

import { products as dummyProducts } from "../data/dummyData.js";


// ======================================================
// STATE
// ======================================================

let productList = [];

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

function initializeProducts() {

    const storedProducts =
        getAllItems(STORAGE_KEYS.products);

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
}


// ======================================================
// ELEMENTS
// ======================================================

function getProductElements() {

    return {

        tableBody:
            $("#productTableBody"),

        searchInput:
            $("#productSearch"),

        categoryFilter:
            $("#productCategoryFilter"),

        stockFilter:
            $("#productStockFilter"),

        sortSelect:
            $("#productSort"),

        itemsPerPageSelect:
            $("#productItemsPerPage"),

        addButton:
            $("#addProductBtn"),

        productModal:
            $("#productModal"),

        productForm:
            $("#productForm"),

        detailsModal:
            $("#productDetailsModal"),

        deleteModal:
            $("#deleteProductModal"),

        prevButton:
            $("#productPrevBtn"),

        nextButton:
            $("#productNextBtn"),

        paginationInfo:
            $("#productPaginationInfo"),

        totalProducts:
            $("#totalProducts"),

        inStockProducts:
            $("#inStockProducts"),

        lowStockProducts:
            $("#lowStockProducts"),

        outOfStockProducts:
            $("#outOfStockProducts")
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
// GET PRODUCT STOCK
// ======================================================

function getProductQuantity(product) {

    return Number(
        product.quantity ??
        product.stock ??
        0
    );
}


// ======================================================
// GET STOCK STATUS
// ======================================================

function getProductStockStatus(product) {

    const quantity =
        getProductQuantity(product);

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

function getStockStatusClass(status) {

    switch (status) {

        case "In Stock":
            return "status-active";

        case "Low Stock":
            return "status-warning";

        case "Out of Stock":
            return "status-inactive";

        default:
            return "";
    }
}


// ======================================================
// GET FILTERED PRODUCTS
// ======================================================

function getFilteredProducts() {

    let result = [...productList];


    // Search
    if (searchTerm) {

        result = result.filter(product => {

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
                ) ||

                matchesSearch(
                    product.description,
                    searchTerm
                )
            );
        });
    }


    // Category
    if (categoryFilter !== "all") {

        result = result.filter(
            product =>
                product.category ===
                categoryFilter
        );
    }


    // Stock status
    if (stockFilter !== "all") {

        result = result.filter(
            product => {

                const status =
                    getProductStockStatus(
                        product
                    );

                return (
                    status.toLowerCase() ===
                    stockFilter.toLowerCase()
                );
            }
        );
    }


    // Sort
    result = sortItems(
        result,
        sortField,
        sortDirection
    );


    return result;
}


// ======================================================
// RENDER CATEGORY FILTER
// ======================================================

function renderCategoryFilter() {

    const elements =
        getProductElements();

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
// RENDER PRODUCT TABLE
// ======================================================

function renderProductTable() {

    const elements =
        getProductElements();


    if (!elements.tableBody) {
        return;
    }


    const filteredProducts =
        getFilteredProducts();


    const pagination =
        paginate(
            filteredProducts,
            currentPage,
            itemsPerPage
        );


    if (pagination.items.length === 0) {

        elements.tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">

                    <div>

                        <i class="fas fa-box-open"></i>

                        <h3>
                            No products found
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
                getProductQuantity(product);

            const status =
                getProductStockStatus(product);

            const statusClass =
                getStockStatusClass(status);


            return `
                <tr data-id="${product.id}">

                    <td>
                        <strong>
                            #${product.id}
                        </strong>
                    </td>


                    <td>

                        <div class="product-info">

                            <div class="product-image">

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
                                            <i class="fas fa-box"></i>
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
                        ${formatCurrency(
                            product.price || 0
                        )}
                    </td>


                    <td>
                        ${quantity}
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
                            product.createdAt ||
                            product.updatedAt
                        )}
                    </td>


                    <td>

                        <div class="table-actions">

                            <button
                                class="btn-icon view-product"
                                data-id="${product.id}"
                                title="View Product"
                            >
                                <i class="fas fa-eye"></i>
                            </button>


                            <button
                                class="btn-icon edit-product"
                                data-id="${product.id}"
                                title="Edit Product"
                            >
                                <i class="fas fa-edit"></i>
                            </button>


                            <button
                                class="btn-icon delete-product"
                                data-id="${product.id}"
                                title="Delete Product"
                            >
                                <i class="fas fa-trash"></i>
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

function updateProductStats() {

    const elements =
        getProductElements();


    const total =
        productList.length;


    const inStock =
        productList.filter(
            product =>
                getProductStockStatus(
                    product
                ) === "In Stock"
        ).length;


    const lowStock =
        productList.filter(
            product =>
                getProductStockStatus(
                    product
                ) === "Low Stock"
        ).length;


    const outOfStock =
        productList.filter(
            product =>
                getProductStockStatus(
                    product
                ) === "Out of Stock"
        ).length;


    if (elements.totalProducts) {

        elements.totalProducts.textContent =
            total;
    }


    if (elements.inStockProducts) {

        elements.inStockProducts.textContent =
            inStock;
    }


    if (elements.lowStockProducts) {

        elements.lowStockProducts.textContent =
            lowStock;
    }


    if (elements.outOfStockProducts) {

        elements.outOfStockProducts.textContent =
            outOfStock;
    }
}


// ======================================================
// PAGINATION
// ======================================================

function updatePagination(pagination) {

    const elements =
        getProductElements();


    if (elements.paginationInfo) {

        if (pagination.totalItems === 0) {

            elements.paginationInfo.textContent =
                "0 products";

        } else {

            const start =
                (pagination.currentPage - 1) *
                pagination.itemsPerPage + 1;


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
        $("#productPaginationNumbers");


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


    container.innerHTML = html;
}


// ======================================================
// OPEN ADD PRODUCT MODAL
// ======================================================

function openAddProductModal() {

    const elements =
        getProductElements();


    selectedProductId = null;


    if (elements.productForm) {

        resetForm(
            elements.productForm
        );
    }


    const title =
        $("#productModalTitle");


    if (title) {

        title.textContent =
            "Add New Product";
    }


    const submitButton =
        $("#productSubmitBtn");


    if (submitButton) {

        submitButton.innerHTML =
            `<i class="fas fa-plus"></i> Add Product`;
    }


    if (elements.productModal) {

        openModal(
            elements.productModal
        );
    }
}


// ======================================================
// OPEN EDIT PRODUCT MODAL
// ======================================================

function openEditProductModal(id) {

    const elements =
        getProductElements();


    const product =
        findProduct(id);


    if (
        !product ||
        !elements.productForm
    ) {
        return;
    }


    selectedProductId =
        product.id;


    const title =
        $("#productModalTitle");


    if (title) {

        title.textContent =
            "Edit Product";
    }


    fillProductForm(product);


    const submitButton =
        $("#productSubmitBtn");


    if (submitButton) {

        submitButton.innerHTML =
            `<i class="fas fa-save"></i> Save Changes`;
    }


    if (elements.productModal) {

        openModal(
            elements.productModal
        );
    }
}


// ======================================================
// FILL PRODUCT FORM
// ======================================================

function fillProductForm(product) {

    const form =
        $("#productForm");


    if (!form) {
        return;
    }


    const quantity =
        getProductQuantity(product);


    const fields = {

        productId:
            product.id,

        name:
            product.name,

        productName:
            product.name,

        sku:
            product.sku || "",

        category:
            product.category || "",

        price:
            product.price || 0,

        quantity:
            quantity,

        stock:
            quantity,

        image:
            product.image || "",

        description:
            product.description || "",

        supplier:
            product.supplier || "",

        status:
            product.status || "Active"
    };


    Object.entries(fields).forEach(
        ([name, value]) => {

            const field =
                form.elements[name] ||
                form.querySelector(
                    `[name="${name}"]`
                );


            if (field) {

                field.value = value;
            }
        }
    );
}


// ======================================================
// GET FORM DATA
// ======================================================

function getProductFormData() {

    const form =
        $("#productForm");


    if (!form) {
        return null;
    }


    const data =
        getFormData(form);


    const name =
        data.name ||
        data.productName ||
        "";


    const quantity =
        data.quantity !== undefined
            ? data.quantity
            : data.stock;


    return {

        name:
            String(name).trim(),

        sku:
            String(
                data.sku || ""
            ).trim(),

        category:
            String(
                data.category || ""
            ).trim(),

        price:
            Number(
                data.price || 0
            ),

        quantity:
            Number(
                quantity || 0
            ),

        image:
            String(
                data.image || ""
            ).trim(),

        description:
            String(
                data.description || ""
            ).trim(),

        supplier:
            String(
                data.supplier || ""
            ).trim(),

        status:
            data.status || "Active"
    };
}


// ======================================================
// VALIDATE PRODUCT
// ======================================================

function validateProduct(product) {

    if (!product.name) {

        showProductMessage(
            "Please enter product name.",
            "error"
        );

        return false;
    }


    if (!product.category) {

        showProductMessage(
            "Please select a product category.",
            "error"
        );

        return false;
    }


    if (product.price < 0) {

        showProductMessage(
            "Product price cannot be negative.",
            "error"
        );

        return false;
    }


    if (product.quantity < 0) {

        showProductMessage(
            "Product quantity cannot be negative.",
            "error"
        );

        return false;
    }


    // Check duplicate SKU
    if (product.sku) {

        const duplicate =
            productList.find(
                existing =>

                    existing.sku &&
                    existing.sku.toLowerCase() ===
                    product.sku.toLowerCase() &&

                    String(existing.id) !==
                    String(selectedProductId)
            );


        if (duplicate) {

            showProductMessage(
                "This SKU already exists.",
                "error"
            );

            return false;
        }
    }


    return true;
}


// ======================================================
// SAVE PRODUCT
// ======================================================

function saveProduct(event) {

    event.preventDefault();


    const productData =
        getProductFormData();


    if (!productData) {
        return;
    }


    if (!validateProduct(productData)) {
        return;
    }


    // EDIT
    if (selectedProductId !== null) {

        const oldProduct =
            findProduct(
                selectedProductId
            );


        const updatedProduct = {

            ...oldProduct,

            ...productData,

            id:
                selectedProductId,

            updatedAt:
                new Date().toISOString()
        };


        productList =
            productList.map(
                product =>

                    String(product.id) ===
                    String(selectedProductId)

                        ? updatedProduct

                        : product
            );


        replaceAllItems(
            STORAGE_KEYS.products,
            productList
        );


        showProductMessage(
            "Product updated successfully.",
            "success"
        );
    }


    // ADD
    else {

        const newProduct = {

            id:
                getNextId(
                    productList
                ),

            ...productData,

            createdAt:
                new Date().toISOString()
        };


        productList.push(
            newProduct
        );


        replaceAllItems(
            STORAGE_KEYS.products,
            productList
        );


        showProductMessage(
            "Product added successfully.",
            "success"
        );
    }


    selectedProductId = null;

    closeProductModal();

    currentPage = 1;

    renderCategoryFilter();

    renderProductTable();

    updateProductStats();
}


// ======================================================
// CLOSE PRODUCT MODAL
// ======================================================

function closeProductModal() {

    const modal =
        $("#productModal");


    if (modal) {

        closeModal(modal);
    }
}


// ======================================================
// OPEN PRODUCT DETAILS
// ======================================================

function openProductDetails(id) {

    const product =
        findProduct(id);


    const modal =
        $("#productDetailsModal");


    if (!product || !modal) {
        return;
    }


    const content =
        $("#productDetailsContent");


    if (!content) {
        return;
    }


    const quantity =
        getProductQuantity(product);


    const stockStatus =
        getProductStockStatus(product);


    const statusClass =
        getStockStatusClass(
            stockStatus
        );


    content.innerHTML = `

        <div class="product-details-header">

            <div class="product-details-image">

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
                            <i class="fas fa-box"></i>
                          `
                }

            </div>


            <div>

                <h2>
                    ${escapeHTML(
                        product.name
                    )}
                </h2>

                <p>
                    SKU:
                    ${escapeHTML(
                        product.sku || "N/A"
                    )}
                </p>

                <span
                    class="status-badge ${statusClass}"
                >
                    ${stockStatus}
                </span>

            </div>

        </div>


        <div class="product-details-grid">

            <div class="profile-detail">

                <span>Category</span>

                <strong>
                    ${escapeHTML(
                        product.category || "-"
                    )}
                </strong>

            </div>


            <div class="profile-detail">

                <span>Price</span>

                <strong>
                    ${formatCurrency(
                        product.price || 0
                    )}
                </strong>

            </div>


            <div class="profile-detail">

                <span>Quantity</span>

                <strong>
                    ${quantity}
                </strong>

            </div>


            <div class="profile-detail">

                <span>Supplier</span>

                <strong>
                    ${escapeHTML(
                        product.supplier || "-"
                    )}
                </strong>

            </div>


            <div class="profile-detail">

                <span>Product Status</span>

                <strong>
                    ${escapeHTML(
                        product.status || "Active"
                    )}
                </strong>

            </div>


            <div class="profile-detail">

                <span>Created</span>

                <strong>
                    ${formatDate(
                        product.createdAt
                    )}
                </strong>

            </div>

        </div>


        <div class="product-description">

            <h3>
                Description
            </h3>

            <p>
                ${escapeHTML(
                    product.description ||
                    "No description available."
                )}
            </p>

        </div>


        <div class="profile-actions">

            <button
                class="btn btn-primary product-details-edit"
                data-id="${product.id}"
            >

                <i class="fas fa-edit"></i>

                Edit Product

            </button>

        </div>
    `;


    selectedProductId =
        product.id;


    openModal(modal);
}


// ======================================================
// DELETE MODAL
// ======================================================

function openDeleteProductModal(id) {

    const product =
        findProduct(id);


    const modal =
        $("#deleteProductModal");


    if (!product || !modal) {
        return;
    }


    selectedProductId =
        product.id;


    const nameElement =
        $("#deleteProductName");


    if (nameElement) {

        nameElement.textContent =
            product.name;
    }


    openModal(modal);
}


// ======================================================
// CONFIRM DELETE
// ======================================================

function confirmDeleteProduct() {

    if (
        selectedProductId === null
    ) {
        return;
    }


    productList =
        productList.filter(
            product =>
                String(product.id) !==
                String(selectedProductId)
        );


    replaceAllItems(
        STORAGE_KEYS.products,
        productList
    );


    showProductMessage(
        "Product deleted successfully.",
        "success"
    );


    selectedProductId = null;


    closeDeleteModal();


    const totalPages =
        Math.ceil(
            productList.length /
            itemsPerPage
        );


    if (
        currentPage > totalPages &&
        totalPages > 0
    ) {

        currentPage =
            totalPages;
    }


    renderCategoryFilter();

    renderProductTable();

    updateProductStats();
}


// ======================================================
// CLOSE DELETE MODAL
// ======================================================

function closeDeleteModal() {

    const modal =
        $("#deleteProductModal");


    if (modal) {

        closeModal(modal);
    }
}


// ======================================================
// SHOW MESSAGE
// ======================================================

function showProductMessage(
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
        document.createElement("div");


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


    container.appendChild(toast);


    setTimeout(
        () => toast.remove(),
        3000
    );
}


// ======================================================
// SEARCH
// ======================================================

const handleProductSearch =
    debounce(
        value => {

            searchTerm =
                value
                    .trim()
                    .toLowerCase();


            currentPage = 1;


            renderProductTable();

        },
        300
    );


// ======================================================
// EVENTS
// ======================================================

function initializeProductEvents() {

    const elements =
        getProductElements();


    // Add Product
    if (elements.addButton) {

        elements.addButton.addEventListener(
            "click",
            openAddProductModal
        );
    }


    // Search
    if (elements.searchInput) {

        elements.searchInput.addEventListener(
            "input",
            event => {

                handleProductSearch(
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

                renderProductTable();
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

                renderProductTable();
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


                renderProductTable();
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


                renderProductTable();
            }
        );
    }


    // Previous
    if (elements.prevButton) {

        elements.prevButton.addEventListener(
            "click",
            () => {

                if (currentPage > 1) {

                    currentPage--;

                    renderProductTable();
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
                    getFilteredProducts()
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

                    renderProductTable();
                }
            }
        );
    }


    // Table actions
    if (elements.tableBody) {

        elements.tableBody.addEventListener(
            "click",
            event => {

                const viewButton =
                    event.target.closest(
                        ".view-product"
                    );


                const editButton =
                    event.target.closest(
                        ".edit-product"
                    );


                const deleteButton =
                    event.target.closest(
                        ".delete-product"
                    );


                if (viewButton) {

                    openProductDetails(
                        viewButton.dataset.id
                    );

                    return;
                }


                if (editButton) {

                    openEditProductModal(
                        editButton.dataset.id
                    );

                    return;
                }


                if (deleteButton) {

                    openDeleteProductModal(
                        deleteButton.dataset.id
                    );

                    return;
                }
            }
        );
    }


    // Form
    if (elements.productForm) {

        elements.productForm.addEventListener(
            "submit",
            saveProduct
        );
    }


    // Pagination numbers
    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "#productPaginationNumbers .pagination-number"
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

                renderProductTable();
            }
        }
    );


    // Confirm Delete
    const confirmDelete =
        $("#confirmDeleteProduct");


    if (confirmDelete) {

        confirmDelete.addEventListener(
            "click",
            confirmDeleteProduct
        );
    }


    // Details Edit
    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".product-details-edit"
                );


            if (!button) {
                return;
            }


            const id =
                button.dataset.id;


            const detailsModal =
                $("#productDetailsModal");


            if (detailsModal) {

                closeModal(
                    detailsModal
                );
            }


            openEditProductModal(id);
        }
    );


    // Close Modal
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


            closeProductModal();

            closeDeleteModal();


            const detailsModal =
                $("#productDetailsModal");


            if (detailsModal) {

                closeModal(
                    detailsModal
                );
            }
        }
    );
}


// ======================================================
// INITIALIZE PRODUCT PAGE
// ======================================================

export function initProducts() {

    // Only run on products page
    if (!$("#productTableBody")) {
        return;
    }


    initializeProducts();

    renderCategoryFilter();

    updateProductStats();

    renderProductTable();

    initializeProductEvents();


    console.log(
        "NEXORA ERP: Product Management initialized."
    );
}


// ======================================================
// EXPORTS
// ======================================================

export {
    initializeProducts,
    getFilteredProducts,
    renderProductTable,
    updateProductStats,
    openAddProductModal,
    openEditProductModal,
    openProductDetails,
    openDeleteProductModal,
    confirmDeleteProduct,
    getProductStockStatus
};


// ======================================================
// AUTO INITIALIZE
// ======================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initProducts
    );

} else {

    initProducts();
}