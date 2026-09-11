/* =========================================================
   NEXORA ERP
   SIDEBAR MANAGEMENT
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

const sidebar =
    document.querySelector(".sidebar");

const sidebarToggle =
    document.querySelector(
        "#sidebarToggle, .sidebar-toggle"
    );

const sidebarClose =
    document.querySelector(
        "#sidebarClose, .sidebar-close"
    );

const sidebarOverlay =
    document.querySelector(
        ".sidebar-overlay"
    );


/* =========================================================
   OPEN SIDEBAR
   ========================================================= */

export function openSidebar() {

    if (!sidebar) {
        return;
    }

    sidebar.classList.add("open");

    document.body.classList.add(
        "sidebar-open"
    );

    if (sidebarOverlay) {

        sidebarOverlay.classList.add(
            "show"
        );
    }
}


/* =========================================================
   CLOSE SIDEBAR
   ========================================================= */

export function closeSidebar() {

    if (!sidebar) {
        return;
    }

    sidebar.classList.remove("open");

    document.body.classList.remove(
        "sidebar-open"
    );

    if (sidebarOverlay) {

        sidebarOverlay.classList.remove(
            "show"
        );
    }
}


/* =========================================================
   TOGGLE SIDEBAR
   ========================================================= */

export function toggleSidebar() {

    if (!sidebar) {
        return;
    }

    const isOpen =
        sidebar.classList.contains("open");

    if (isOpen) {
        closeSidebar();
    } else {
        openSidebar();
    }
}


/* =========================================================
   SET ACTIVE MENU
   ========================================================= */

export function setActiveMenu() {

    const currentPage =
        window.location.pathname
            .split("/")
            .pop();

    const menuLinks =
        document.querySelectorAll(
            ".sidebar a[href]"
        );

    menuLinks.forEach(link => {

        const href =
            link.getAttribute("href");

        if (!href) {
            return;
        }

        const linkPage =
            href.split("/")
                .pop()
                .split("#")[0];

        link.classList.remove("active");

        if (
            linkPage &&
            linkPage === currentPage
        ) {

            link.classList.add("active");
        }
    });
}


/* =========================================================
   CLOSE SIDEBAR WHEN LINK IS CLICKED
   ========================================================= */

export function initializeMenuLinks() {

    const menuLinks =
        document.querySelectorAll(
            ".sidebar a[href]"
        );

    menuLinks.forEach(link => {

        link.addEventListener(
            "click",
            () => {

                /*
                 * Sidebar automatically closes
                 * on smaller screens.
                 */

                if (
                    window.innerWidth <= 991
                ) {
                    closeSidebar();
                }
            }
        );
    });
}


/* =========================================================
   OVERLAY CLICK
   ========================================================= */

export function initializeOverlay() {

    if (!sidebarOverlay) {
        return;
    }

    sidebarOverlay.addEventListener(
        "click",
        closeSidebar
    );
}


/* =========================================================
   TOGGLE BUTTON
   ========================================================= */

export function initializeSidebarToggle() {

    if (!sidebarToggle) {
        return;
    }

    sidebarToggle.addEventListener(
        "click",
        toggleSidebar
    );
}


/* =========================================================
   CLOSE BUTTON
   ========================================================= */

export function initializeSidebarClose() {

    if (!sidebarClose) {
        return;
    }

    sidebarClose.addEventListener(
        "click",
        closeSidebar
    );
}


/* =========================================================
   ESCAPE KEY
   ========================================================= */

export function initializeEscapeKey() {

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {
                closeSidebar();
            }
        }
    );
}


/* =========================================================
   HANDLE WINDOW RESIZE
   ========================================================= */

export function initializeResizeHandler() {

    window.addEventListener(
        "resize",
        () => {

            /*
             * If screen becomes desktop size,
             * remove mobile sidebar state.
             */

            if (window.innerWidth > 991) {

                closeSidebar();
            }
        }
    );
}


/* =========================================================
   SIDEBAR DROPDOWNS
   ========================================================= */

export function initializeDropdowns() {

    const dropdownButtons =
        document.querySelectorAll(
            ".sidebar .dropdown-toggle"
        );

    dropdownButtons.forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                const parent =
                    button.closest(
                        ".sidebar-dropdown"
                    );

                if (!parent) {
                    return;
                }

                const dropdown =
                    parent.querySelector(
                        ".dropdown-menu"
                    );

                if (!dropdown) {
                    return;
                }

                const isOpen =
                    parent.classList.contains(
                        "open"
                    );

                /*
                 * Close other dropdowns
                 */

                document
                    .querySelectorAll(
                        ".sidebar-dropdown.open"
                    )
                    .forEach(item => {

                        if (item !== parent) {

                            item.classList.remove(
                                "open"
                            );
                        }
                    });


                /*
                 * Toggle current dropdown
                 */

                parent.classList.toggle(
                    "open",
                    !isOpen
                );
            }
        );
    });
}


/* =========================================================
   INITIALIZE SIDEBAR
   ========================================================= */

export function initSidebar() {

    /*
     * If this page doesn't have
     * a sidebar, do nothing.
     */

    if (!sidebar) {
        return;
    }

    initializeSidebarToggle();

    initializeSidebarClose();

    initializeOverlay();

    initializeMenuLinks();

    initializeEscapeKey();

    initializeResizeHandler();

    initializeDropdowns();

    setActiveMenu();
}


/* =========================================================
   DEFAULT EXPORT
   ========================================================= */

export default {
    openSidebar,
    closeSidebar,
    toggleSidebar,
    setActiveMenu,
    initializeMenuLinks,
    initializeOverlay,
    initializeSidebarToggle,
    initializeSidebarClose,
    initializeEscapeKey,
    initializeResizeHandler,
    initializeDropdowns,
    initSidebar
};