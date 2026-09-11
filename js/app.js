/* =========================================================
   NEXORA ERP
   MAIN APPLICATION
   ========================================================= */

import {
    initializeData,
    STORAGE_KEYS
} from "./storage.js";

import {
    initTheme
} from "./theme.js";

import {
    initSidebar
} from "./sidebar.js";

import {
    initNotifications
} from "./notifications.js";

import {
    initAuth,
    getCurrentUser,
    isLoggedIn
} from "./auth.js";

import {
    employees,
    customers,
    products,
    sales,
    expenses,
    notifications,
    inventoryHistory
} from "../data/dummyData.js";


/* =========================================================
   INITIALIZE DEMO DATA
   ========================================================= */

function initializeDemoData() {

    initializeData(
        STORAGE_KEYS.employees,
        employees
    );

    initializeData(
        STORAGE_KEYS.customers,
        customers
    );

    initializeData(
        STORAGE_KEYS.products,
        products
    );

    initializeData(
        STORAGE_KEYS.sales,
        sales
    );

    initializeData(
        STORAGE_KEYS.expenses,
        expenses
    );

    initializeData(
        STORAGE_KEYS.notifications,
        notifications
    );

    initializeData(
        STORAGE_KEYS.inventoryHistory,
        inventoryHistory
    );
}


/* =========================================================
   UPDATE USER INFORMATION
   ========================================================= */

function updateUserInformation() {

    const user =
        getCurrentUser();

    if (!user) {
        return;
    }


    /*
     * User name
     */

    const nameElements =
        document.querySelectorAll(
            "#userName, .user-name"
        );

    nameElements.forEach(element => {

        element.textContent =
            user.name || "User";
    });


    /*
     * User email
     */

    const emailElements =
        document.querySelectorAll(
            "#userEmail, .user-email"
        );

    emailElements.forEach(element => {

        element.textContent =
            user.email || "";
    });


    /*
     * User role
     */

    const roleElements =
        document.querySelectorAll(
            "#userRole, .user-role"
        );

    roleElements.forEach(element => {

        element.textContent =
            user.role || "Employee";
    });


    /*
     * User initials
     */

    const initials =
        getUserInitials(
            user.name
        );


    const avatarElements =
        document.querySelectorAll(
            "#userAvatar, .user-avatar"
        );

    avatarElements.forEach(element => {

        /*
         * If avatar contains an image,
         * don't replace it.
         */

        if (
            element.tagName.toLowerCase() ===
            "img"
        ) {

            element.alt =
                user.name || "User";

            return;
        }


        element.textContent =
            initials;
    });
}


/* =========================================================
   GET USER INITIALS
   ========================================================= */

function getUserInitials(name = "") {

    const words =
        String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);


    if (words.length === 0) {
        return "U";
    }


    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();
    }


    return (
        words[0][0] +
        words[words.length - 1][0]
    ).toUpperCase();
}


/* =========================================================
   ROLE BASED ACCESS
   ========================================================= */

function applyRoleAccess() {

    const user =
        getCurrentUser();

    if (!user) {
        return;
    }


    const role =
        user.role;


    /*
     * Elements that can have
     * data-role attribute.
     *
     * Example:
     *
     * data-role="Admin"
     *
     * or
     *
     * data-role="Admin,Manager"
     */

    const roleElements =
        document.querySelectorAll(
            "[data-role]"
        );


    roleElements.forEach(element => {

        const allowedRoles =
            element.dataset.role
                .split(",")
                .map(role =>
                    role.trim()
                );


        if (
            !allowedRoles.includes(role)
        ) {

            element.style.display =
                "none";
        }
    });
}


/* =========================================================
   AUTH GUARD
   ========================================================= */

function protectPrivatePage() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    /*
     * Authentication pages
     * don't require login.
     */

    const publicPages = [
        "",
        "index.html",
        "login.html",
        "signup.html",
        "forgot-password.html",
        "reset-password.html"
    ];


    if (
        publicPages.includes(
            currentPage
        )
    ) {

        return;
    }


    /*
     * Check login
     */

    if (!isLoggedIn()) {

        window.location.href =
            "login.html";
    }
}


/* =========================================================
   PREVENT LOGGED USER FROM AUTH PAGES
   ========================================================= */

function redirectLoggedInUser() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    const authPages = [
        "login.html",
        "signup.html",
        "forgot-password.html",
        "reset-password.html"
    ];


    if (
        !authPages.includes(
            currentPage
        )
    ) {

        return;
    }


    if (isLoggedIn()) {

        window.location.href =
            "dashboard.html";
    }
}


/* =========================================================
   UPDATE CURRENT YEAR
   ========================================================= */

function updateCurrentYear() {

    const year =
        new Date().getFullYear();


    const elements =
        document.querySelectorAll(
            "#currentYear, .current-year"
        );


    elements.forEach(element => {

        element.textContent =
            year;
    });
}


/* =========================================================
   GLOBAL LOADING
   ========================================================= */

function hideInitialLoader() {

    const loader =
        document.querySelector(
            "#loadingOverlay, .loading-overlay"
        );


    if (!loader) {
        return;
    }


    setTimeout(() => {

        loader.classList.remove(
            "show"
        );

        loader.style.display =
            "none";

    }, 300);
}


/* =========================================================
   GLOBAL CLICK HANDLER
   ========================================================= */

function initializeGlobalEvents() {

    document.addEventListener(
        "click",
        event => {

            /*
             * Generic modal close
             */

            const closeButton =
                event.target.closest(
                    "[data-close-modal]"
                );


            if (closeButton) {

                const modal =
                    closeButton.closest(
                        ".modal"
                    );


                if (modal) {

                    modal.classList.remove(
                        "show"
                    );
                }
            }


            /*
             * Click outside modal
             */

            if (
                event.target.classList.contains(
                    "modal"
                )
            ) {

                event.target.classList.remove(
                    "show"
                );
            }
        }
    );
}


/* =========================================================
   PAGE READY
   ========================================================= */

function initializeApplication() {

    /*
     * Step 1
     * Load demo data
     */

    initializeDemoData();


    /*
     * Step 2
     * Theme
     */

    initTheme();


    /*
     * Step 3
     * Sidebar
     */

    initSidebar();


    /*
     * Step 4
     * Notifications
     */

    initNotifications();


    /*
     * Step 5
     * Authentication
     */

    initAuth();


    /*
     * Step 6
     * User information
     */

    updateUserInformation();


    /*
     * Step 7
     * Role permissions
     */

    applyRoleAccess();


    /*
     * Step 8
     * Global events
     */

    initializeGlobalEvents();


    /*
     * Step 9
     * Current year
     */

    updateCurrentYear();


    /*
     * Step 10
     * Hide loading screen
     */

    hideInitialLoader();
}


/* =========================================================
   DOM CONTENT LOADED
   ========================================================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApplication
    );

} else {

    initializeApplication();
}


/* =========================================================
   EXPORT
   ========================================================= */

export {
    initializeApplication,
    initializeDemoData,
    updateUserInformation,
    applyRoleAccess,
    protectPrivatePage,
    redirectLoggedInUser
};