// ======================================================
// NEXORA ERP - Employee Management
// File: js/employees.js
// ======================================================

import {
    STORAGE_KEYS,
    getAllItems,
    replaceAllItems,
    addItem,
    updateItem,
    deleteItem,
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

import { employees as dummyEmployees } from "../data/dummyData.js";


// ======================================================
// STATE
// ======================================================

let employeeList = [];

let currentPage = 1;
let itemsPerPage = 5;

let searchTerm = "";
let statusFilter = "all";
let departmentFilter = "all";
let sortField = "id";
let sortDirection = "asc";

let selectedEmployeeId = null;


// ======================================================
// INITIALIZE DATA
// ======================================================

function initializeEmployees() {
    const storedEmployees = getAllItems(STORAGE_KEYS.employees);

    if (storedEmployees.length > 0) {
        employeeList = storedEmployees;
    } else {
        employeeList = dummyEmployees.map(employee => ({ ...employee }));
        replaceAllItems(STORAGE_KEYS.employees, employeeList);
    }
}


// ======================================================
// GET ELEMENTS
// ======================================================

function getEmployeeElements() {
    return {
        tableBody: $("#employeeTableBody"),
        searchInput: $("#employeeSearch"),
        statusFilter: $("#employeeStatusFilter"),
        departmentFilter: $("#employeeDepartmentFilter"),
        sortSelect: $("#employeeSort"),
        itemsPerPageSelect: $("#employeeItemsPerPage"),

        addButton: $("#addEmployeeBtn"),

        employeeModal: $("#employeeModal"),
        employeeForm: $("#employeeForm"),

        profileModal: $("#employeeProfileModal"),

        deleteModal: $("#deleteEmployeeModal"),

        prevButton: $("#employeePrevBtn"),
        nextButton: $("#employeeNextBtn"),

        paginationInfo: $("#employeePaginationInfo"),

        totalEmployees: $("#totalEmployees"),
        activeEmployees: $("#activeEmployees"),
        inactiveEmployees: $("#inactiveEmployees"),
        totalSalary: $("#totalSalary")
    };
}


// ======================================================
// GET FILTERED EMPLOYEES
// ======================================================

function getFilteredEmployees() {
    let result = [...employeeList];

    // Search
    if (searchTerm) {
        result = result.filter(employee => {
            return (
                matchesSearch(employee.name, searchTerm) ||
                matchesSearch(employee.email, searchTerm) ||
                matchesSearch(employee.phone, searchTerm) ||
                matchesSearch(employee.department, searchTerm) ||
                matchesSearch(employee.position, searchTerm)
            );
        });
    }

    // Status filter
    if (statusFilter !== "all") {
        result = result.filter(employee => {
            return employee.status?.toLowerCase() === statusFilter.toLowerCase();
        });
    }

    // Department filter
    if (departmentFilter !== "all") {
        result = result.filter(employee => {
            return employee.department === departmentFilter;
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
// RENDER DEPARTMENT FILTER
// ======================================================

function renderDepartmentFilter() {
    const elements = getEmployeeElements();

    if (!elements.departmentFilter) return;

    const departments = [
        ...new Set(
            employeeList
                .map(employee => employee.department)
                .filter(Boolean)
        )
    ];

    elements.departmentFilter.innerHTML = `
        <option value="all">All Departments</option>
        ${departments
            .map(department => `
                <option value="${escapeHTML(department)}">
                    ${escapeHTML(department)}
                </option>
            `)
            .join("")}
    `;

    elements.departmentFilter.value = departmentFilter;
}


// ======================================================
// RENDER EMPLOYEE TABLE
// ======================================================

function renderEmployeeTable() {
    const elements = getEmployeeElements();

    if (!elements.tableBody) return;

    const filteredEmployees = getFilteredEmployees();

    const pagination = paginate(
        filteredEmployees,
        currentPage,
        itemsPerPage
    );

    const pageItems = pagination.items;

    if (pageItems.length === 0) {
        elements.tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-state">
                    <div>
                        <i class="fas fa-users"></i>
                        <h3>No employees found</h3>
                        <p>Try changing your search or filter.</p>
                    </div>
                </td>
            </tr>
        `;

        updatePagination(pagination);
        return;
    }

    elements.tableBody.innerHTML = pageItems.map(employee => {

        const status = employee.status || "Active";

        const statusClass =
            status.toLowerCase() === "active"
                ? "status-active"
                : "status-inactive";

        return `
            <tr data-id="${employee.id}">

                <td>
                    <strong>#${employee.id}</strong>
                </td>

                <td>
                    <div class="employee-info">

                        <div class="employee-avatar">
                            ${getInitials(employee.name)}
                        </div>

                        <div>
                            <strong>
                                ${escapeHTML(employee.name)}
                            </strong>

                            <small>
                                ${escapeHTML(employee.email || "")}
                            </small>
                        </div>

                    </div>
                </td>

                <td>
                    ${escapeHTML(employee.position || "-")}
                </td>

                <td>
                    ${escapeHTML(employee.department || "-")}
                </td>

                <td>
                    ${escapeHTML(employee.phone || "-")}
                </td>

                <td>
                    ${formatCurrency(employee.salary || 0)}
                </td>

                <td>
                    ${formatDate(employee.joinDate || employee.joiningDate)}
                </td>

                <td>
                    <span class="status-badge ${statusClass}">
                        ${escapeHTML(status)}
                    </span>
                </td>

                <td>
                    <div class="table-actions">

                        <button
                            class="btn-icon view-employee"
                            data-id="${employee.id}"
                            title="View Profile"
                        >
                            <i class="fas fa-eye"></i>
                        </button>

                        <button
                            class="btn-icon edit-employee"
                            data-id="${employee.id}"
                            title="Edit Employee"
                        >
                            <i class="fas fa-edit"></i>
                        </button>

                        <button
                            class="btn-icon delete-employee"
                            data-id="${employee.id}"
                            title="Delete Employee"
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
// PAGINATION
// ======================================================

function updatePagination(pagination) {
    const elements = getEmployeeElements();

    if (elements.paginationInfo) {
        if (pagination.totalItems === 0) {
            elements.paginationInfo.textContent = "0 employees";
        } else {
            const start =
                (pagination.currentPage - 1) *
                pagination.itemsPerPage + 1;

            const end = Math.min(
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
            pagination.currentPage >= pagination.totalPages;
    }

    renderPageNumbers(pagination);
}


// ======================================================
// PAGE NUMBERS
// ======================================================

function renderPageNumbers(pagination) {
    const container =
        $("#employeePaginationNumbers");

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
// UPDATE STATISTICS
// ======================================================

function updateEmployeeStats() {
    const elements = getEmployeeElements();

    const total = employeeList.length;

    const active = employeeList.filter(
        employee =>
            employee.status?.toLowerCase() === "active"
    ).length;

    const inactive = total - active;

    const salary = employeeList.reduce(
        (sum, employee) =>
            sum + Number(employee.salary || 0),
        0
    );

    if (elements.totalEmployees) {
        elements.totalEmployees.textContent = total;
    }

    if (elements.activeEmployees) {
        elements.activeEmployees.textContent = active;
    }

    if (elements.inactiveEmployees) {
        elements.inactiveEmployees.textContent = inactive;
    }

    if (elements.totalSalary) {
        elements.totalSalary.textContent =
            formatCurrency(salary);
    }
}


// ======================================================
// GET INITIALS
// ======================================================

function getInitials(name = "") {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word.charAt(0).toUpperCase())
        .join("");
}


// ======================================================
// FIND EMPLOYEE
// ======================================================

function findEmployee(id) {
    return employeeList.find(
        employee => String(employee.id) === String(id)
    );
}


// ======================================================
// OPEN ADD MODAL
// ======================================================

function openAddEmployeeModal() {
    const elements = getEmployeeElements();

    selectedEmployeeId = null;

    if (elements.employeeForm) {
        resetForm(elements.employeeForm);
    }

    const modalTitle =
        $("#employeeModalTitle");

    if (modalTitle) {
        modalTitle.textContent = "Add New Employee";
    }

    const submitButton =
        $("#employeeSubmitBtn");

    if (submitButton) {
        submitButton.innerHTML =
            `<i class="fas fa-plus"></i> Add Employee`;
    }

    if (elements.employeeModal) {
        openModal(elements.employeeModal);
    }
}


// ======================================================
// OPEN EDIT MODAL
// ======================================================

function openEditEmployeeModal(id) {
    const elements = getEmployeeElements();

    const employee = findEmployee(id);

    if (!employee || !elements.employeeForm) return;

    selectedEmployeeId = employee.id;

    const modalTitle =
        $("#employeeModalTitle");

    if (modalTitle) {
        modalTitle.textContent = "Edit Employee";
    }

    fillEmployeeForm(employee);

    const submitButton =
        $("#employeeSubmitBtn");

    if (submitButton) {
        submitButton.innerHTML =
            `<i class="fas fa-save"></i> Save Changes`;
    }

    if (elements.employeeModal) {
        openModal(elements.employeeModal);
    }
}


// ======================================================
// FILL FORM
// ======================================================

function fillEmployeeForm(employee) {
    const form = $("#employeeForm");

    if (!form) return;

    const fields = {
        employeeId: employee.id,
        name: employee.name,
        employeeName: employee.name,

        email: employee.email,
        phone: employee.phone,

        position: employee.position,
        department: employee.department,

        salary: employee.salary,

        joinDate:
            employee.joinDate ||
            employee.joiningDate ||
            "",

        status: employee.status || "Active",

        address: employee.address || ""
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
// GET FORM EMPLOYEE DATA
// ======================================================

function getEmployeeFormData() {
    const form = $("#employeeForm");

    if (!form) return null;

    const data = getFormData(form);

    const name =
        data.name ||
        data.employeeName ||
        "";

    return {
        name: name.trim(),

        email:
            String(data.email || "").trim(),

        phone:
            String(data.phone || "").trim(),

        position:
            String(data.position || "").trim(),

        department:
            String(data.department || "").trim(),

        salary:
            Number(data.salary || 0),

        joinDate:
            data.joinDate ||
            data.joiningDate ||
            "",

        status:
            data.status || "Active",

        address:
            String(data.address || "").trim()
    };
}


// ======================================================
// VALIDATE EMPLOYEE
// ======================================================

function validateEmployee(employee) {

    if (!employee.name) {
        showEmployeeMessage(
            "Please enter employee name.",
            "error"
        );
        return false;
    }

    if (
        employee.email &&
        !isValidEmail(employee.email)
    ) {
        showEmployeeMessage(
            "Please enter a valid email address.",
            "error"
        );
        return false;
    }

    if (
        employee.phone &&
        !isValidPhone(employee.phone)
    ) {
        showEmployeeMessage(
            "Please enter a valid phone number.",
            "error"
        );
        return false;
    }

    if (employee.salary < 0) {
        showEmployeeMessage(
            "Salary cannot be negative.",
            "error"
        );
        return false;
    }

    return true;
}


// ======================================================
// SAVE EMPLOYEE
// ======================================================

function saveEmployee(event) {
    event.preventDefault();

    const employeeData =
        getEmployeeFormData();

    if (!employeeData) return;

    if (!validateEmployee(employeeData)) {
        return;
    }

    // EDIT
    if (selectedEmployeeId !== null) {

        const updatedEmployee = {
            ...employeeData,
            id: selectedEmployeeId
        };

        employeeList = employeeList.map(
            employee =>
                String(employee.id) ===
                String(selectedEmployeeId)
                    ? updatedEmployee
                    : employee
        );

        replaceAllItems(
            STORAGE_KEYS.employees,
            employeeList
        );

        showEmployeeMessage(
            "Employee updated successfully.",
            "success"
        );

    }

    // ADD
    else {

        const newEmployee = {
            id: getNextId(employeeList),

            ...employeeData,

            createdAt:
                new Date().toISOString()
        };

        employeeList.push(newEmployee);

        replaceAllItems(
            STORAGE_KEYS.employees,
            employeeList
        );

        showEmployeeMessage(
            "Employee added successfully.",
            "success"
        );
    }

    selectedEmployeeId = null;

    closeEmployeeModal();

    currentPage = 1;

    renderEmployeeTable();
    updateEmployeeStats();
    renderDepartmentFilter();
}


// ======================================================
// CLOSE EMPLOYEE MODAL
// ======================================================

function closeEmployeeModal() {
    const modal = $("#employeeModal");

    if (modal) {
        closeModal(modal);
    }
}


// ======================================================
// OPEN PROFILE
// ======================================================

function openEmployeeProfile(id) {
    const employee = findEmployee(id);

    const modal = $("#employeeProfileModal");

    if (!employee || !modal) return;

    const content =
        $("#employeeProfileContent");

    if (!content) return;

    const status = employee.status || "Active";

    const statusClass =
        status.toLowerCase() === "active"
            ? "status-active"
            : "status-inactive";

    content.innerHTML = `
        <div class="profile-header">

            <div class="profile-avatar">
                ${getInitials(employee.name)}
            </div>

            <div>
                <h2>
                    ${escapeHTML(employee.name)}
                </h2>

                <p>
                    ${escapeHTML(employee.position || "-")}
                </p>

                <span class="status-badge ${statusClass}">
                    ${escapeHTML(status)}
                </span>
            </div>

        </div>

        <div class="profile-details">

            <div class="profile-detail">
                <span>Email</span>
                <strong>
                    ${escapeHTML(employee.email || "-")}
                </strong>
            </div>

            <div class="profile-detail">
                <span>Phone</span>
                <strong>
                    ${escapeHTML(employee.phone || "-")}
                </strong>
            </div>

            <div class="profile-detail">
                <span>Department</span>
                <strong>
                    ${escapeHTML(employee.department || "-")}
                </strong>
            </div>

            <div class="profile-detail">
                <span>Position</span>
                <strong>
                    ${escapeHTML(employee.position || "-")}
                </strong>
            </div>

            <div class="profile-detail">
                <span>Salary</span>
                <strong>
                    ${formatCurrency(employee.salary || 0)}
                </strong>
            </div>

            <div class="profile-detail">
                <span>Join Date</span>
                <strong>
                    ${formatDate(
                        employee.joinDate ||
                        employee.joiningDate
                    )}
                </strong>
            </div>

            <div class="profile-detail">
                <span>Address</span>
                <strong>
                    ${escapeHTML(employee.address || "-")}
                </strong>
            </div>

        </div>

        <div class="profile-actions">

            <button
                class="btn btn-primary profile-edit-btn"
                data-id="${employee.id}"
            >
                <i class="fas fa-edit"></i>
                Edit Employee
            </button>

        </div>
    `;

    selectedEmployeeId = employee.id;

    openModal(modal);
}


// ======================================================
// DELETE EMPLOYEE
// ======================================================

function openDeleteEmployeeModal(id) {
    const employee = findEmployee(id);

    const modal = $("#deleteEmployeeModal");

    if (!employee || !modal) return;

    selectedEmployeeId = employee.id;

    const nameElement =
        $("#deleteEmployeeName");

    if (nameElement) {
        nameElement.textContent =
            employee.name;
    }

    openModal(modal);
}


// ======================================================
// CONFIRM DELETE
// ======================================================

function confirmDeleteEmployee() {

    if (selectedEmployeeId === null) {
        return;
    }

    employeeList = employeeList.filter(
        employee =>
            String(employee.id) !==
            String(selectedEmployeeId)
    );

    replaceAllItems(
        STORAGE_KEYS.employees,
        employeeList
    );

    showEmployeeMessage(
        "Employee deleted successfully.",
        "success"
    );

    selectedEmployeeId = null;

    closeDeleteModal();

    const totalPages =
        Math.ceil(
            employeeList.length /
            itemsPerPage
        );

    if (
        currentPage > totalPages &&
        totalPages > 0
    ) {
        currentPage = totalPages;
    }

    renderEmployeeTable();
    updateEmployeeStats();
    renderDepartmentFilter();
}


// ======================================================
// CLOSE DELETE MODAL
// ======================================================

function closeDeleteModal() {
    const modal =
        $("#deleteEmployeeModal");

    if (modal) {
        closeModal(modal);
    }
}


// ======================================================
// SHOW MESSAGE
// ======================================================

function showEmployeeMessage(
    message,
    type = "success"
) {

    // If global toast function exists
    if (typeof window.showToast === "function") {
        window.showToast(message, type);
        return;
    }

    // Fallback
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
        <span>${escapeHTML(message)}</span>
        <button type="button">&times;</button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}


// ======================================================
// SEARCH
// ======================================================

const handleEmployeeSearch =
    debounce((value) => {

        searchTerm =
            value.trim().toLowerCase();

        currentPage = 1;

        renderEmployeeTable();

    }, 300);


// ======================================================
// EVENT LISTENERS
// ======================================================

function initializeEmployeeEvents() {

    const elements =
        getEmployeeElements();

    // Add employee
    if (elements.addButton) {
        elements.addButton.addEventListener(
            "click",
            openAddEmployeeModal
        );
    }

    // Search
    if (elements.searchInput) {
        elements.searchInput.addEventListener(
            "input",
            event => {
                handleEmployeeSearch(
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

                renderEmployeeTable();
            }
        );
    }

    // Department filter
    if (elements.departmentFilter) {
        elements.departmentFilter.addEventListener(
            "change",
            event => {

                departmentFilter =
                    event.target.value;

                currentPage = 1;

                renderEmployeeTable();
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

                if (value.includes("-desc")) {

                    sortField =
                        value.replace("-desc", "");

                    sortDirection = "desc";

                } else {

                    sortField =
                        value.replace("-asc", "");

                    sortDirection = "asc";
                }

                currentPage = 1;

                renderEmployeeTable();
            }
        );
    }

    // Items per page
    if (elements.itemsPerPageSelect) {
        elements.itemsPerPageSelect.addEventListener(
            "change",
            event => {

                itemsPerPage =
                    Number(event.target.value) || 5;

                currentPage = 1;

                renderEmployeeTable();
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
                    renderEmployeeTable();
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
                    getFilteredEmployees().length;

                const totalPages =
                    Math.ceil(
                        total / itemsPerPage
                    );

                if (currentPage < totalPages) {
                    currentPage++;
                    renderEmployeeTable();
                }
            }
        );
    }

    // Pagination numbers
    document.addEventListener(
        "click",
        event => {

            const pageButton =
                event.target.closest(
                    ".pagination-number"
                );

            if (!pageButton) return;

            const page =
                Number(
                    pageButton.dataset.page
                );

            if (page) {
                currentPage = page;
                renderEmployeeTable();
            }
        }
    );

    // Table actions
    if (elements.tableBody) {

        elements.tableBody.addEventListener(
            "click",
            event => {

                const viewButton =
                    event.target.closest(
                        ".view-employee"
                    );

                const editButton =
                    event.target.closest(
                        ".edit-employee"
                    );

                const deleteButton =
                    event.target.closest(
                        ".delete-employee"
                    );

                if (viewButton) {

                    openEmployeeProfile(
                        viewButton.dataset.id
                    );

                    return;
                }

                if (editButton) {

                    openEditEmployeeModal(
                        editButton.dataset.id
                    );

                    return;
                }

                if (deleteButton) {

                    openDeleteEmployeeModal(
                        deleteButton.dataset.id
                    );

                    return;
                }
            }
        );
    }

    // Employee form
    if (elements.employeeForm) {
        elements.employeeForm.addEventListener(
            "submit",
            saveEmployee
        );
    }

    // Modal close buttons
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
                document.getElementById(modalId);

            if (modal) {
                closeModal(modal);
            }
        }
    );

    // Confirm delete
    const confirmDelete =
        $("#confirmDeleteEmployee");

    if (confirmDelete) {
        confirmDelete.addEventListener(
            "click",
            confirmDeleteEmployee
        );
    }

    // Profile edit
    document.addEventListener(
        "click",
        event => {

            const editButton =
                event.target.closest(
                    ".profile-edit-btn"
                );

            if (!editButton) return;

            const id =
                editButton.dataset.id;

            closeModal(
                $("#employeeProfileModal")
            );

            openEditEmployeeModal(id);
        }
    );

    // ESC key
    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") return;

            closeEmployeeModal();
            closeDeleteModal();

            const profileModal =
                $("#employeeProfileModal");

            if (profileModal) {
                closeModal(profileModal);
            }
        }
    );
}


// ======================================================
// INITIALIZE EMPLOYEE PAGE
// ======================================================

export function initEmployees() {

    // Only run on employee page
    const table =
        $("#employeeTableBody");

    if (!table) return;

    initializeEmployees();

    renderDepartmentFilter();

    updateEmployeeStats();

    renderEmployeeTable();

    initializeEmployeeEvents();

    console.log(
        "NEXORA ERP: Employee Management initialized."
    );
}


// ======================================================
// EXPORT FUNCTIONS
// ======================================================

export {
    initializeEmployees,
    getFilteredEmployees,
    renderEmployeeTable,
    updateEmployeeStats,
    openAddEmployeeModal,
    openEditEmployeeModal,
    openEmployeeProfile,
    openDeleteEmployeeModal,
    confirmDeleteEmployee
};


// ======================================================
// AUTO INITIALIZE
// ======================================================

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initEmployees
    );

} else {

    initEmployees();
}