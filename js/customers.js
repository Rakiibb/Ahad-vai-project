// ======================================================
// NEXORA ERP - Customer Management
// File: js/customers.js
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
    isValidEmail,
    isValidPhone
} from "./utils.js";

import { customers as dummyCustomers } from "../data/dummyData.js";


// ======================================================
// STATE
// ======================================================

let customerList = [];

let currentPage = 1;
let itemsPerPage = 5;

let searchTerm = "";
let statusFilter = "all";
let sortField = "id";
let sortDirection = "asc";

let selectedCustomerId = null;


// ======================================================
// INITIALIZE DATA
// ======================================================

function initializeCustomers() {
    const storedCustomers =
        getAllItems(STORAGE_KEYS.customers);

    if (storedCustomers.length > 0) {
        customerList = storedCustomers;
    } else {
        customerList = dummyCustomers.map(
            customer => ({ ...customer })
        );

        replaceAllItems(
            STORAGE_KEYS.customers,
            customerList
        );
    }
}


// ======================================================
// GET ELEMENTS
// ======================================================

function getCustomerElements() {
    return {
        tableBody: $("#customerTableBody"),

        searchInput: $("#customerSearch"),

        statusFilter: $("#customerStatusFilter"),

        sortSelect: $("#customerSort"),

        itemsPerPageSelect:
            $("#customerItemsPerPage"),

        addButton:
            $("#addCustomerBtn"),

        customerModal:
            $("#customerModal"),

        customerForm:
            $("#customerForm"),

        profileModal:
            $("#customerProfileModal"),

        deleteModal:
            $("#deleteCustomerModal"),

        prevButton:
            $("#customerPrevBtn"),

        nextButton:
            $("#customerNextBtn"),

        paginationInfo:
            $("#customerPaginationInfo"),

        totalCustomers:
            $("#totalCustomers"),

        activeCustomers:
            $("#activeCustomers"),

        inactiveCustomers:
            $("#inactiveCustomers"),

        totalSpent:
            $("#totalCustomerSpent")
    };
}


// ======================================================
// FIND CUSTOMER
// ======================================================

function findCustomer(id) {
    return customerList.find(
        customer =>
            String(customer.id) === String(id)
    );
}


// ======================================================
// GET FILTERED CUSTOMERS
// ======================================================

function getFilteredCustomers() {

    let result = [...customerList];

    // Search
    if (searchTerm) {

        result = result.filter(customer => {

            return (
                matchesSearch(
                    customer.name,
                    searchTerm
                ) ||

                matchesSearch(
                    customer.email,
                    searchTerm
                ) ||

                matchesSearch(
                    customer.phone,
                    searchTerm
                ) ||

                matchesSearch(
                    customer.company,
                    searchTerm
                ) ||

                matchesSearch(
                    customer.address,
                    searchTerm
                )
            );
        });
    }


    // Status filter
    if (statusFilter !== "all") {

        result = result.filter(customer => {

            return (
                customer.status?.toLowerCase() ===
                statusFilter.toLowerCase()
            );
        });
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
// RENDER CUSTOMER TABLE
// ======================================================

function renderCustomerTable() {

    const elements =
        getCustomerElements();

    if (!elements.tableBody) return;


    const filteredCustomers =
        getFilteredCustomers();


    const pagination =
        paginate(
            filteredCustomers,
            currentPage,
            itemsPerPage
        );


    if (pagination.items.length === 0) {

        elements.tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">

                    <div>
                        <i class="fas fa-users"></i>

                        <h3>
                            No customers found
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
        pagination.items.map(customer => {

            const status =
                customer.status || "Active";


            const statusClass =
                status.toLowerCase() === "active"
                    ? "status-active"
                    : "status-inactive";


            return `
                <tr data-id="${customer.id}">

                    <td>
                        <strong>
                            #${customer.id}
                        </strong>
                    </td>


                    <td>

                        <div class="customer-info">

                            <div class="customer-avatar">
                                ${getInitials(
                                    customer.name
                                )}
                            </div>

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        customer.name
                                    )}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        customer.email || ""
                                    )}
                                </small>

                            </div>

                        </div>

                    </td>


                    <td>
                        ${escapeHTML(
                            customer.company || "-"
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            customer.phone || "-"
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            customer.address || "-"
                        )}
                    </td>


                    <td>
                        ${formatCurrency(
                            customer.totalSpent || 0
                        )}
                    </td>


                    <td>
                        ${formatDate(
                            customer.joinDate ||
                            customer.createdAt
                        )}
                    </td>


                    <td>

                        <span
                            class="status-badge ${statusClass}"
                        >
                            ${escapeHTML(status)}
                        </span>

                    </td>


                    <td>

                        <div class="table-actions">

                            <button
                                class="btn-icon view-customer"
                                data-id="${customer.id}"
                                title="View Profile"
                            >
                                <i class="fas fa-eye"></i>
                            </button>


                            <button
                                class="btn-icon edit-customer"
                                data-id="${customer.id}"
                                title="Edit Customer"
                            >
                                <i class="fas fa-edit"></i>
                            </button>


                            <button
                                class="btn-icon delete-customer"
                                data-id="${customer.id}"
                                title="Delete Customer"
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
// GET INITIALS
// ======================================================

function getInitials(name = "") {

    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(
            word =>
                word
                    .charAt(0)
                    .toUpperCase()
        )
        .join("");
}


// ======================================================
// UPDATE STATS
// ======================================================

function updateCustomerStats() {

    const elements =
        getCustomerElements();


    const total =
        customerList.length;


    const active =
        customerList.filter(
            customer =>
                customer.status?.toLowerCase() ===
                "active"
        ).length;


    const inactive =
        total - active;


    const totalSpent =
        customerList.reduce(
            (sum, customer) =>
                sum +
                Number(
                    customer.totalSpent || 0
                ),
            0
        );


    if (elements.totalCustomers) {
        elements.totalCustomers.textContent =
            total;
    }


    if (elements.activeCustomers) {
        elements.activeCustomers.textContent =
            active;
    }


    if (elements.inactiveCustomers) {
        elements.inactiveCustomers.textContent =
            inactive;
    }


    if (elements.totalSpent) {
        elements.totalSpent.textContent =
            formatCurrency(totalSpent);
    }
}


// ======================================================
// PAGINATION
// ======================================================

function updatePagination(pagination) {

    const elements =
        getCustomerElements();


    if (elements.paginationInfo) {

        if (pagination.totalItems === 0) {

            elements.paginationInfo.textContent =
                "0 customers";

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
        $("#customerPaginationNumbers");

    if (!container) return;


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
// OPEN ADD MODAL
// ======================================================

function openAddCustomerModal() {

    const elements =
        getCustomerElements();


    selectedCustomerId = null;


    if (elements.customerForm) {

        resetForm(
            elements.customerForm
        );
    }


    const title =
        $("#customerModalTitle");


    if (title) {

        title.textContent =
            "Add New Customer";
    }


    const submitButton =
        $("#customerSubmitBtn");


    if (submitButton) {

        submitButton.innerHTML =
            `<i class="fas fa-plus"></i> Add Customer`;
    }


    if (elements.customerModal) {

        openModal(
            elements.customerModal
        );
    }
}


// ======================================================
// OPEN EDIT MODAL
// ======================================================

function openEditCustomerModal(id) {

    const elements =
        getCustomerElements();


    const customer =
        findCustomer(id);


    if (
        !customer ||
        !elements.customerForm
    ) {
        return;
    }


    selectedCustomerId =
        customer.id;


    const title =
        $("#customerModalTitle");


    if (title) {

        title.textContent =
            "Edit Customer";
    }


    fillCustomerForm(customer);


    const submitButton =
        $("#customerSubmitBtn");


    if (submitButton) {

        submitButton.innerHTML =
            `<i class="fas fa-save"></i> Save Changes`;
    }


    if (elements.customerModal) {

        openModal(
            elements.customerModal
        );
    }
}


// ======================================================
// FILL CUSTOMER FORM
// ======================================================

function fillCustomerForm(customer) {

    const form =
        $("#customerForm");

    if (!form) return;


    const fields = {

        customerId:
            customer.id,

        name:
            customer.name,

        customerName:
            customer.name,

        email:
            customer.email,

        phone:
            customer.phone,

        company:
            customer.company || "",

        address:
            customer.address || "",

        city:
            customer.city || "",

        country:
            customer.country || "",

        status:
            customer.status || "Active",

        totalSpent:
            customer.totalSpent || 0
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

function getCustomerFormData() {

    const form =
        $("#customerForm");

    if (!form) return null;


    const data =
        getFormData(form);


    const name =
        data.name ||
        data.customerName ||
        "";


    return {

        name:
            name.trim(),

        email:
            String(
                data.email || ""
            ).trim(),

        phone:
            String(
                data.phone || ""
            ).trim(),

        company:
            String(
                data.company || ""
            ).trim(),

        address:
            String(
                data.address || ""
            ).trim(),

        city:
            String(
                data.city || ""
            ).trim(),

        country:
            String(
                data.country || ""
            ).trim(),

        status:
            data.status || "Active",

        totalSpent:
            Number(
                data.totalSpent || 0
            )
    };
}


// ======================================================
// VALIDATE CUSTOMER
// ======================================================

function validateCustomer(customer) {

    if (!customer.name) {

        showCustomerMessage(
            "Please enter customer name.",
            "error"
        );

        return false;
    }


    if (
        customer.email &&
        !isValidEmail(customer.email)
    ) {

        showCustomerMessage(
            "Please enter a valid email address.",
            "error"
        );

        return false;
    }


    if (
        customer.phone &&
        !isValidPhone(customer.phone)
    ) {

        showCustomerMessage(
            "Please enter a valid phone number.",
            "error"
        );

        return false;
    }


    if (customer.totalSpent < 0) {

        showCustomerMessage(
            "Total spent cannot be negative.",
            "error"
        );

        return false;
    }


    return true;
}


// ======================================================
// SAVE CUSTOMER
// ======================================================

function saveCustomer(event) {

    event.preventDefault();


    const customerData =
        getCustomerFormData();


    if (!customerData) return;


    if (
        !validateCustomer(
            customerData
        )
    ) {
        return;
    }


    // EDIT
    if (selectedCustomerId !== null) {

        const updatedCustomer = {

            ...customerData,

            id:
                selectedCustomerId
        };


        customerList =
            customerList.map(
                customer =>

                    String(customer.id) ===
                    String(selectedCustomerId)

                        ? updatedCustomer

                        : customer
            );


        replaceAllItems(
            STORAGE_KEYS.customers,
            customerList
        );


        showCustomerMessage(
            "Customer updated successfully.",
            "success"
        );
    }


    // ADD
    else {

        const newCustomer = {

            id:
                getNextId(
                    customerList
                ),

            ...customerData,

            createdAt:
                new Date().toISOString()
        };


        customerList.push(
            newCustomer
        );


        replaceAllItems(
            STORAGE_KEYS.customers,
            customerList
        );


        showCustomerMessage(
            "Customer added successfully.",
            "success"
        );
    }


    selectedCustomerId = null;

    closeCustomerModal();

    currentPage = 1;

    renderCustomerTable();

    updateCustomerStats();
}


// ======================================================
// CLOSE CUSTOMER MODAL
// ======================================================

function closeCustomerModal() {

    const modal =
        $("#customerModal");


    if (modal) {

        closeModal(modal);
    }
}


// ======================================================
// OPEN CUSTOMER PROFILE
// ======================================================

function openCustomerProfile(id) {

    const customer =
        findCustomer(id);


    const modal =
        $("#customerProfileModal");


    if (!customer || !modal) {
        return;
    }


    const content =
        $("#customerProfileContent");


    if (!content) return;


    const status =
        customer.status || "Active";


    const statusClass =
        status.toLowerCase() === "active"
            ? "status-active"
            : "status-inactive";


    content.innerHTML = `

        <div class="profile-header">

            <div class="profile-avatar">
                ${getInitials(
                    customer.name
                )}
            </div>


            <div>

                <h2>
                    ${escapeHTML(
                        customer.name
                    )}
                </h2>


                <p>
                    ${escapeHTML(
                        customer.company || "Customer"
                    )}
                </p>


                <span
                    class="status-badge ${statusClass}"
                >
                    ${escapeHTML(status)}
                </span>

            </div>

        </div>


        <div class="profile-details">

            <div class="profile-detail">

                <span>Email</span>

                <strong>
                    ${escapeHTML(
                        customer.email || "-"
                    )}
                </strong>

            </div>


            <div class="profile-detail">

                <span>Phone</span>

                <strong>
                    ${escapeHTML(
                        customer.phone || "-"
                    )}
                </strong>

            </div>


            <div class="profile-detail">

                <span>Company</span>

                <strong>
                    ${escapeHTML(
                        customer.company || "-"
                    )}
                </strong>

            </div>


            <div class="profile-detail">

                <span>Address</span>

                <strong>
                    ${escapeHTML(
                        customer.address || "-"
                    )}
                </strong>

            </div>


            <div class="profile-detail">

                <span>City</span>

                <strong>
                    ${escapeHTML(
                        customer.city || "-"
                    )}
                </strong>

            </div>


            <div class="profile-detail">

                <span>Country</span>

                <strong>
                    ${escapeHTML(
                        customer.country || "-"
                    )}
                </strong>

            </div>


            <div class="profile-detail">

                <span>Total Spent</span>

                <strong>
                    ${formatCurrency(
                        customer.totalSpent || 0
                    )}
                </strong>

            </div>


            <div class="profile-detail">

                <span>Customer Since</span>

                <strong>
                    ${formatDate(
                        customer.joinDate ||
                        customer.createdAt
                    )}
                </strong>

            </div>

        </div>


        <div class="profile-actions">

            <button
                class="btn btn-primary profile-edit-customer"
                data-id="${customer.id}"
            >

                <i class="fas fa-edit"></i>

                Edit Customer

            </button>

        </div>
    `;


    selectedCustomerId =
        customer.id;


    openModal(modal);
}


// ======================================================
// OPEN DELETE MODAL
// ======================================================

function openDeleteCustomerModal(id) {

    const customer =
        findCustomer(id);


    const modal =
        $("#deleteCustomerModal");


    if (!customer || !modal) {
        return;
    }


    selectedCustomerId =
        customer.id;


    const nameElement =
        $("#deleteCustomerName");


    if (nameElement) {

        nameElement.textContent =
            customer.name;
    }


    openModal(modal);
}


// ======================================================
// CONFIRM DELETE
// ======================================================

function confirmDeleteCustomer() {

    if (
        selectedCustomerId === null
    ) {
        return;
    }


    customerList =
        customerList.filter(
            customer =>
                String(customer.id) !==
                String(selectedCustomerId)
        );


    replaceAllItems(
        STORAGE_KEYS.customers,
        customerList
    );


    showCustomerMessage(
        "Customer deleted successfully.",
        "success"
    );


    selectedCustomerId = null;


    closeDeleteModal();


    const totalPages =
        Math.ceil(
            customerList.length /
            itemsPerPage
        );


    if (
        currentPage > totalPages &&
        totalPages > 0
    ) {

        currentPage =
            totalPages;
    }


    renderCustomerTable();

    updateCustomerStats();
}


// ======================================================
// CLOSE DELETE MODAL
// ======================================================

function closeDeleteModal() {

    const modal =
        $("#deleteCustomerModal");


    if (modal) {

        closeModal(modal);
    }
}


// ======================================================
// SHOW MESSAGE
// ======================================================

function showCustomerMessage(
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

const handleCustomerSearch =
    debounce(
        value => {

            searchTerm =
                value
                    .trim()
                    .toLowerCase();


            currentPage = 1;


            renderCustomerTable();

        },
        300
    );


// ======================================================
// EVENT LISTENERS
// ======================================================

function initializeCustomerEvents() {

    const elements =
        getCustomerElements();


    // Add
    if (elements.addButton) {

        elements.addButton.addEventListener(
            "click",
            openAddCustomerModal
        );
    }


    // Search
    if (elements.searchInput) {

        elements.searchInput.addEventListener(
            "input",
            event => {

                handleCustomerSearch(
                    event.target.value
                );
            }
        );
    }


    // Status filter
    if (elements.statusFilter) {

        elements.statusFilter.addEventListener(
            "change",
            event => {

                statusFilter =
                    event.target.value;

                currentPage = 1;

                renderCustomerTable();
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


                renderCustomerTable();
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


                renderCustomerTable();
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

                    renderCustomerTable();
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
                    getFilteredCustomers()
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

                    renderCustomerTable();
                }
            }
        );
    }


    // Table action delegation
    if (elements.tableBody) {

        elements.tableBody.addEventListener(
            "click",
            event => {

                const viewButton =
                    event.target.closest(
                        ".view-customer"
                    );


                const editButton =
                    event.target.closest(
                        ".edit-customer"
                    );


                const deleteButton =
                    event.target.closest(
                        ".delete-customer"
                    );


                if (viewButton) {

                    openCustomerProfile(
                        viewButton.dataset.id
                    );

                    return;
                }


                if (editButton) {

                    openEditCustomerModal(
                        editButton.dataset.id
                    );

                    return;
                }


                if (deleteButton) {

                    openDeleteCustomerModal(
                        deleteButton.dataset.id
                    );

                    return;
                }
            }
        );
    }


    // Customer form
    if (elements.customerForm) {

        elements.customerForm.addEventListener(
            "submit",
            saveCustomer
        );
    }


    // Pagination number
    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "#customerPaginationNumbers .pagination-number"
                );


            if (!button) return;


            const page =
                Number(
                    button.dataset.page
                );


            if (page) {

                currentPage =
                    page;

                renderCustomerTable();
            }
        }
    );


    // Confirm delete
    const confirmDelete =
        $("#confirmDeleteCustomer");


    if (confirmDelete) {

        confirmDelete.addEventListener(
            "click",
            confirmDeleteCustomer
        );
    }


    // Profile edit
    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".profile-edit-customer"
                );


            if (!button) return;


            const id =
                button.dataset.id;


            const profileModal =
                $("#customerProfileModal");


            if (profileModal) {

                closeModal(
                    profileModal
                );
            }


            openEditCustomerModal(id);
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


            if (!closeButton) return;


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


            closeCustomerModal();

            closeDeleteModal();


            const profileModal =
                $("#customerProfileModal");


            if (profileModal) {

                closeModal(
                    profileModal
                );
            }
        }
    );
}


// ======================================================
// INITIALIZE CUSTOMER PAGE
// ======================================================

export function initCustomers() {

    // Only run on customers page
    if (!$("#customerTableBody")) {
        return;
    }


    initializeCustomers();

    updateCustomerStats();

    renderCustomerTable();

    initializeCustomerEvents();


    console.log(
        "NEXORA ERP: Customer Management initialized."
    );
}


// ======================================================
// EXPORTS
// ======================================================

export {
    initializeCustomers,
    getFilteredCustomers,
    renderCustomerTable,
    updateCustomerStats,
    openAddCustomerModal,
    openEditCustomerModal,
    openCustomerProfile,
    openDeleteCustomerModal,
    confirmDeleteCustomer
};


// ======================================================
// AUTO INITIALIZE
// ======================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initCustomers
    );

} else {

    initCustomers();
}