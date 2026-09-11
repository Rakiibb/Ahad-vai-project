/* =========================================================
   NEXORA ERP
   THEME MANAGEMENT
   Light / Dark Mode
   ========================================================= */

import {
    saveData,
    getData
} from "./storage.js";

import {
    STORAGE_KEYS
} from "./storage.js";


/* =========================================================
   THEME CONSTANTS
   ========================================================= */

const THEMES = {
    LIGHT: "light",
    DARK: "dark"
};


/* =========================================================
   GET SYSTEM THEME
   ========================================================= */

function getSystemTheme() {

    if (
        window.matchMedia &&
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches
    ) {
        return THEMES.DARK;
    }

    return THEMES.LIGHT;
}


/* =========================================================
   GET CURRENT THEME
   ========================================================= */

export function getCurrentTheme() {

    const savedTheme = getData(
        STORAGE_KEYS.theme,
        null
    );

    if (
        savedTheme === THEMES.LIGHT ||
        savedTheme === THEMES.DARK
    ) {
        return savedTheme;
    }

    return getSystemTheme();
}


/* =========================================================
   APPLY THEME
   ========================================================= */

export function applyTheme(theme) {

    if (
        theme !== THEMES.LIGHT &&
        theme !== THEMES.DARK
    ) {
        theme = THEMES.LIGHT;
    }

    document.documentElement.setAttribute(
        "data-theme",
        theme
    );

    document.body.classList.toggle(
        "dark-mode",
        theme === THEMES.DARK
    );

    document.body.classList.toggle(
        "light-mode",
        theme === THEMES.LIGHT
    );

    updateThemeButton(theme);
}


/* =========================================================
   SAVE THEME
   ========================================================= */

export function saveTheme(theme) {

    saveData(
        STORAGE_KEYS.theme,
        theme
    );
}


/* =========================================================
   SET THEME
   ========================================================= */

export function setTheme(theme) {

    if (
        theme !== THEMES.LIGHT &&
        theme !== THEMES.DARK
    ) {
        return;
    }

    applyTheme(theme);

    saveTheme(theme);
}


/* =========================================================
   TOGGLE THEME
   ========================================================= */

export function toggleTheme() {

    const currentTheme =
        getCurrentTheme();

    const newTheme =
        currentTheme === THEMES.DARK
            ? THEMES.LIGHT
            : THEMES.DARK;

    setTheme(newTheme);
}


/* =========================================================
   UPDATE THEME BUTTON
   ========================================================= */

function updateThemeButton(theme) {

    const themeButtons =
        document.querySelectorAll(
            "#themeToggle, .theme-toggle"
        );

    themeButtons.forEach(button => {

        const icon =
            button.querySelector("i");

        const text =
            button.querySelector(".theme-text");

        if (theme === THEMES.DARK) {

            button.setAttribute(
                "aria-label",
                "Switch to light mode"
            );

            button.setAttribute(
                "title",
                "Switch to light mode"
            );

            if (icon) {

                icon.className =
                    "fa-solid fa-sun";
            }

            if (text) {

                text.textContent =
                    "Light Mode";
            }

        } else {

            button.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );

            button.setAttribute(
                "title",
                "Switch to dark mode"
            );

            if (icon) {

                icon.className =
                    "fa-solid fa-moon";
            }

            if (text) {

                text.textContent =
                    "Dark Mode";
            }
        }
    });
}


/* =========================================================
   INITIALIZE THEME
   ========================================================= */

export function initializeTheme() {

    const theme =
        getCurrentTheme();

    applyTheme(theme);
}


/* =========================================================
   THEME BUTTON EVENT
   ========================================================= */

export function initializeThemeToggle() {

    const themeButtons =
        document.querySelectorAll(
            "#themeToggle, .theme-toggle"
        );

    themeButtons.forEach(button => {

        button.addEventListener(
            "click",
            toggleTheme
        );
    });
}


/* =========================================================
   WATCH SYSTEM THEME CHANGES
   ========================================================= */

export function watchSystemTheme() {

    if (!window.matchMedia) {
        return;
    }

    const mediaQuery =
        window.matchMedia(
            "(prefers-color-scheme: dark)"
        );

    mediaQuery.addEventListener(
        "change",
        event => {

            const savedTheme =
                getData(
                    STORAGE_KEYS.theme,
                    null
                );

            /*
             * If user has manually selected
             * a theme, don't override it.
             */

            if (savedTheme) {
                return;
            }

            const newTheme =
                event.matches
                    ? THEMES.DARK
                    : THEMES.LIGHT;

            applyTheme(newTheme);
        }
    );
}


/* =========================================================
   INITIALIZE EVERYTHING
   ========================================================= */

export function initTheme() {

    initializeTheme();

    initializeThemeToggle();

    watchSystemTheme();
}


/* =========================================================
   DEFAULT EXPORT
   ========================================================= */

export default {
    getCurrentTheme,
    applyTheme,
    saveTheme,
    setTheme,
    toggleTheme,
    initializeTheme,
    initializeThemeToggle,
    watchSystemTheme,
    initTheme
};