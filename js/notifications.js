/* =========================================================
   NEXORA ERP
   NOTIFICATION MANAGEMENT
   ========================================================= */

import {
    getData,
    saveData,
    STORAGE_KEYS
} from "./storage.js";

import {
    escapeHTML,
    formatDateTime
} from "./utils.js";


/* =========================================================
   NOTIFICATION STATE
   ========================================================= */

let notifications = [];


/* =========================================================
   LOAD NOTIFICATIONS
   ========================================================= */

export function loadNotifications() {

    notifications = getData(
        STORAGE_KEYS.notifications,
        []
    );

    if (!Array.isArray(notifications)) {
        notifications = [];
    }

    return notifications;
}


/* =========================================================
   SAVE NOTIFICATIONS
   ========================================================= */

function saveNotifications() {

    saveData(
        STORAGE_KEYS.notifications,
        notifications
    );
}


/* =========================================================
   GET NOTIFICATIONS
   ========================================================= */

export function getNotifications() {

    return [...notifications];
}


/* =========================================================
   UNREAD COUNT
   ========================================================= */

export function getUnreadCount() {

    return notifications.filter(
        notification =>
            notification.read !== true
    ).length;
}


/* =========================================================
   UPDATE NOTIFICATION BADGE
   ========================================================= */

export function updateNotificationBadge() {

    const badges =
        document.querySelectorAll(
            "#notificationBadge, .notification-badge"
        );

    const unreadCount =
        getUnreadCount();

    badges.forEach(badge => {

        badge.textContent =
            unreadCount > 99
                ? "99+"
                : unreadCount;

        badge.classList.toggle(
            "show",
            unreadCount > 0
        );
    });
}


/* =========================================================
   NOTIFICATION ICON
   ========================================================= */

function getNotificationIcon(type) {

    switch (type) {

        case "warning":
            return "fa-solid fa-triangle-exclamation";

        case "success":
            return "fa-solid fa-circle-check";

        case "error":
            return "fa-solid fa-circle-xmark";

        case "order":
            return "fa-solid fa-cart-shopping";

        case "customer":
            return "fa-solid fa-user";

        case "inventory":
            return "fa-solid fa-box";

        case "info":
        default:
            return "fa-solid fa-circle-info";
    }
}


/* =========================================================
   NOTIFICATION TITLE
   ========================================================= */

function getNotificationTitle(
    notification
) {

    return escapeHTML(
        notification.title ||
        "Notification"
    );
}


/* =========================================================
   NOTIFICATION MESSAGE
   ========================================================= */

function getNotificationMessage(
    notification
) {

    return escapeHTML(
        notification.message ||
        ""
    );
}


/* =========================================================
   RENDER NOTIFICATIONS
   ========================================================= */

export function renderNotifications() {

    const containers =
        document.querySelectorAll(
            "#notificationList, .notification-list"
        );

    containers.forEach(container => {

        if (notifications.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-bell-slash"></i>

                    <p>No notifications</p>

                    <span>
                        You're all caught up.
                    </span>
                </div>
            `;

            return;
        }


        container.innerHTML =
            notifications.map(
                notification => {

                    const icon =
                        getNotificationIcon(
                            notification.type
                        );

                    const unread =
                        notification.read !== true;

                    return `
                        <div
                            class="notification-item ${
                                unread ? "unread" : ""
                            }"
                            data-notification-id="${
                                notification.id
                            }"
                        >

                            <div class="notification-icon">
                                <i class="${icon}"></i>
                            </div>

                            <div class="notification-content">

                                <h4>
                                    ${getNotificationTitle(
                                        notification
                                    )}
                                </h4>

                                <p>
                                    ${getNotificationMessage(
                                        notification
                                    )}
                                </p>

                                <span class="notification-time">
                                    ${
                                        notification.date
                                            ? formatDateTime(
                                                notification.date
                                            )
                                            : ""
                                    }
                                </span>

                            </div>

                            <button
                                type="button"
                                class="notification-delete"
                                data-action="delete-notification"
                                data-id="${
                                    notification.id
                                }"
                                aria-label="Delete notification"
                            >
                                <i class="fa-solid fa-xmark"></i>
                            </button>

                        </div>
                    `;
                }
            ).join("");
    });


    updateNotificationBadge();
}


/* =========================================================
   MARK AS READ
   ========================================================= */

export function markAsRead(id) {

    const notification =
        notifications.find(
            item =>
                Number(item.id) === Number(id)
        );

    if (!notification) {
        return;
    }

    notification.read = true;

    saveNotifications();

    renderNotifications();
}


/* =========================================================
   MARK ALL AS READ
   ========================================================= */

export function markAllAsRead() {

    notifications =
        notifications.map(
            notification => ({
                ...notification,
                read: true
            })
        );

    saveNotifications();

    renderNotifications();

    showToast(
        "All notifications marked as read",
        "success"
    );
}


/* =========================================================
   DELETE NOTIFICATION
   ========================================================= */

export function deleteNotification(id) {

    notifications =
        notifications.filter(
            notification =>
                Number(notification.id) !== Number(id)
        );

    saveNotifications();

    renderNotifications();
}


/* =========================================================
   ADD NOTIFICATION
   ========================================================= */

export function addNotification({
    title,
    message,
    type = "info"
}) {

    const newNotification = {

        id: Date.now(),

        title,

        message,

        type,

        read: false,

        date: new Date().toISOString()
    };


    notifications.unshift(
        newNotification
    );


    saveNotifications();

    renderNotifications();

    showToast(
        title,
        type === "warning"
            ? "warning"
            : "success"
    );

    return newNotification;
}


/* =========================================================
   CLEAR ALL NOTIFICATIONS
   ========================================================= */

export function clearNotifications() {

    notifications = [];

    saveNotifications();

    renderNotifications();

    showToast(
        "All notifications cleared",
        "success"
    );
}


/* =========================================================
   NOTIFICATION PANEL
   ========================================================= */

export function openNotificationPanel() {

    const panel =
        document.querySelector(
            "#notificationPanel, .notification-panel"
        );

    if (!panel) {
        return;
    }

    panel.classList.add("show");

    document.body.classList.add(
        "notification-open"
    );
}


export function closeNotificationPanel() {

    const panel =
        document.querySelector(
            "#notificationPanel, .notification-panel"
        );

    if (!panel) {
        return;
    }

    panel.classList.remove("show");

    document.body.classList.remove(
        "notification-open"
    );
}


export function toggleNotificationPanel() {

    const panel =
        document.querySelector(
            "#notificationPanel, .notification-panel"
        );

    if (!panel) {
        return;
    }

    const isOpen =
        panel.classList.contains("show");

    if (isOpen) {
        closeNotificationPanel();
    } else {
        openNotificationPanel();
    }
}


/* =========================================================
   TOAST NOTIFICATION
   ========================================================= */

export function showToast(
    message,
    type = "success",
    duration = 3000
) {

    let container =
        document.querySelector(
            "#toastContainer, .toast-container"
        );


    /*
     * Create toast container
     * if it doesn't exist.
     */

    if (!container) {

        container =
            document.createElement("div");

        container.id =
            "toastContainer";

        container.className =
            "toast-container";

        document.body.appendChild(
            container
        );
    }


    const toast =
        document.createElement("div");

    toast.className =
        `toast toast-${type}`;


    let icon =
        "fa-solid fa-circle-check";


    if (type === "error") {

        icon =
            "fa-solid fa-circle-xmark";

    } else if (type === "warning") {

        icon =
            "fa-solid fa-triangle-exclamation";

    } else if (type === "info") {

        icon =
            "fa-solid fa-circle-info";
    }


    toast.innerHTML = `
        <div class="toast-icon">
            <i class="${icon}"></i>
        </div>

        <div class="toast-message">
            ${escapeHTML(message)}
        </div>

        <button
            type="button"
            class="toast-close"
            aria-label="Close notification"
        >
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;


    container.appendChild(toast);


    /*
     * Close button
     */

    const closeButton =
        toast.querySelector(
            ".toast-close"
        );

    closeButton.addEventListener(
        "click",
        () => {

            removeToast(toast);
        }
    );


    /*
     * Automatically remove toast
     */

    const timeoutId =
        setTimeout(
            () => {

                removeToast(toast);

            },
            duration
        );


    /*
     * Store timeout on element
     */

    toast.dataset.timeout =
        timeoutId;
}


/* =========================================================
   REMOVE TOAST
   ========================================================= */

function removeToast(toast) {

    if (!toast) {
        return;
    }

    toast.classList.add("removing");

    setTimeout(() => {

        toast.remove();

    }, 250);
}


/* =========================================================
   EVENT DELEGATION
   ========================================================= */

export function initializeNotificationEvents() {

    /*
     * Notification list
     */

    const lists =
        document.querySelectorAll(
            "#notificationList, .notification-list"
        );


    lists.forEach(list => {

        list.addEventListener(
            "click",
            event => {

                const deleteButton =
                    event.target.closest(
                        "[data-action='delete-notification']"
                    );


                /*
                 * Delete notification
                 */

                if (deleteButton) {

                    const id =
                        deleteButton.dataset.id;

                    deleteNotification(id);

                    return;
                }


                /*
                 * Click notification
                 * to mark it as read
                 */

                const item =
                    event.target.closest(
                        ".notification-item"
                    );

                if (item) {

                    const id =
                        item.dataset.notificationId;

                    markAsRead(id);
                }
            }
        );
    });


    /*
     * Notification toggle button
     */

    const toggleButtons =
        document.querySelectorAll(
            "#notificationToggle, .notification-toggle"
        );


    toggleButtons.forEach(button => {

        button.addEventListener(
            "click",
            toggleNotificationPanel
        );
    });


    /*
     * Mark all as read
     */

    const markAllButtons =
        document.querySelectorAll(
            "#markAllNotifications, .mark-all-notifications"
        );


    markAllButtons.forEach(button => {

        button.addEventListener(
            "click",
            markAllAsRead
        );
    });


    /*
     * Clear all notifications
     */

    const clearButtons =
        document.querySelectorAll(
            "#clearNotifications, .clear-notifications"
        );


    clearButtons.forEach(button => {

        button.addEventListener(
            "click",
            clearNotifications
        );
    });


    /*
     * Close notification panel
     */

    const closeButtons =
        document.querySelectorAll(
            "#notificationClose, .notification-close"
        );


    closeButtons.forEach(button => {

        button.addEventListener(
            "click",
            closeNotificationPanel
        );
    });
}


/* =========================================================
   ESCAPE KEY
   ========================================================= */

export function initializeNotificationEscape() {

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closeNotificationPanel();
            }
        }
    );
}


/* =========================================================
   INITIALIZE NOTIFICATIONS
   ========================================================= */

export function initNotifications() {

    loadNotifications();

    renderNotifications();

    initializeNotificationEvents();

    initializeNotificationEscape();
}


/* =========================================================
   DEFAULT EXPORT
   ========================================================= */

export default {

    loadNotifications,

    getNotifications,

    getUnreadCount,

    updateNotificationBadge,

    renderNotifications,

    markAsRead,

    markAllAsRead,

    deleteNotification,

    addNotification,

    clearNotifications,

    openNotificationPanel,

    closeNotificationPanel,

    toggleNotificationPanel,

    showToast,

    initializeNotificationEvents,

    initializeNotificationEscape,

    initNotifications
};