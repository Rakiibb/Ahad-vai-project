/* =========================================================
   NEXORA ERP
   AUTHENTICATION MANAGEMENT
   Frontend Demo Authentication
   ========================================================= */

import {
    saveData,
    getData,
    removeData,
    saveSession,
    getSession,
    STORAGE_KEYS
} from "./storage.js";

import {
    isValidEmail,
    isRequired,
    showElement,
    hideElement
} from "./utils.js";

import {
    showToast
} from "./notifications.js";

import {
    currentUser
} from "../data/dummyData.js";


/* =========================================================
   DEFAULT USERS
   ========================================================= */

const DEFAULT_USERS = [
    {
        id: 1,
        name: "Admin User",
        email: "admin@nexora.com",
        password: "admin123",
        role: "Admin",
        status: "Active"
    },
    {
        id: 2,
        name: "Manager User",
        email: "manager@nexora.com",
        password: "manager123",
        role: "Manager",
        status: "Active"
    },
    {
        id: 3,
        name: "Employee User",
        email: "employee@nexora.com",
        password: "employee123",
        role: "Employee",
        status: "Active"
    }
];


/* =========================================================
   INITIALIZE USERS
   ========================================================= */

export function initializeUsers() {

    const existingUsers =
        getData(
            STORAGE_KEYS.users,
            null
        );

    if (
        !existingUsers ||
        !Array.isArray(existingUsers) ||
        existingUsers.length === 0
    ) {

        saveData(
            STORAGE_KEYS.users,
            DEFAULT_USERS
        );
    }
}


/* =========================================================
   GET USERS
   ========================================================= */

export function getUsers() {

    initializeUsers();

    return getData(
        STORAGE_KEYS.users,
        []
    );
}


/* =========================================================
   SAVE USERS
   ========================================================= */

function saveUsers(users) {

    saveData(
        STORAGE_KEYS.users,
        users
    );
}


/* =========================================================
   FIND USER
   ========================================================= */

export function findUserByEmail(email) {

    const users =
        getUsers();

    return users.find(
        user =>
            user.email.toLowerCase() ===
            String(email).toLowerCase().trim()
    );
}


/* =========================================================
   CURRENT LOGGED-IN USER
   ========================================================= */

export function getCurrentUser() {

    /*
     * First check session storage
     */

    const sessionUser =
        getSession(
            STORAGE_KEYS.currentUser,
            null
        );

    if (sessionUser) {
        return sessionUser;
    }


    /*
     * Then check localStorage
     */

    const savedUser =
        getData(
            STORAGE_KEYS.currentUser,
            null
        );

    return savedUser;
}


/* =========================================================
   IS LOGGED IN
   ========================================================= */

export function isLoggedIn() {

    return Boolean(
        getCurrentUser()
    );
}


/* =========================================================
   LOGIN
   ========================================================= */

export function login(
    email,
    password,
    rememberMe = false
) {

    if (!isRequired(email)) {

        return {
            success: false,
            message: "Email is required."
        };
    }


    if (!isValidEmail(email)) {

        return {
            success: false,
            message: "Please enter a valid email address."
        };
    }


    if (!isRequired(password)) {

        return {
            success: false,
            message: "Password is required."
        };
    }


    const user =
        findUserByEmail(email);


    if (!user) {

        return {
            success: false,
            message: "No account found with this email."
        };
    }


    if (user.password !== password) {

        return {
            success: false,
            message: "Incorrect password."
        };
    }


    if (
        user.status &&
        user.status !== "Active"
    ) {

        return {
            success: false,
            message: "This account is inactive."
        };
    }


    /*
     * Remove password before saving
     */

    const loggedInUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
    };


    /*
     * Remember Me
     */

    if (rememberMe) {

        saveData(
            STORAGE_KEYS.currentUser,
            loggedInUser
        );

        removeSession(
            STORAGE_KEYS.currentUser
        );

    } else {

        saveSession(
            STORAGE_KEYS.currentUser,
            loggedInUser
        );

        removeData(
            STORAGE_KEYS.currentUser
        );
    }


    /*
     * Also update current user data
     */

    saveData(
        STORAGE_KEYS.currentUser,
        loggedInUser
    );


    return {
        success: true,
        user: loggedInUser,
        message: "Login successful."
    };
}


/* =========================================================
   LOGOUT
   ========================================================= */

export function logout() {

    removeData(
        STORAGE_KEYS.currentUser
    );

    removeSession(
        STORAGE_KEYS.currentUser
    );


    /*
     * Go to login page
     */

    window.location.href =
        "../pages/login.html";
}


/* =========================================================
   SIGNUP
   ========================================================= */

export function signup({
    name,
    email,
    password,
    confirmPassword,
    role = "Employee"
}) {

    /*
     * Name validation
     */

    if (!isRequired(name)) {

        return {
            success: false,
            message: "Name is required."
        };
    }


    /*
     * Email validation
     */

    if (!isRequired(email)) {

        return {
            success: false,
            message: "Email is required."
        };
    }


    if (!isValidEmail(email)) {

        return {
            success: false,
            message: "Please enter a valid email address."
        };
    }


    /*
     * Password validation
     */

    if (!isRequired(password)) {

        return {
            success: false,
            message: "Password is required."
        };
    }


    if (password.length < 6) {

        return {
            success: false,
            message:
                "Password must be at least 6 characters."
        };
    }


    /*
     * Confirm password
     */

    if (password !== confirmPassword) {

        return {
            success: false,
            message: "Passwords do not match."
        };
    }


    /*
     * Check existing account
     */

    const existingUser =
        findUserByEmail(email);


    if (existingUser) {

        return {
            success: false,
            message:
                "An account already exists with this email."
        };
    }


    /*
     * Create new user
     */

    const users =
        getUsers();


    const newUser = {

        id:
            Date.now(),

        name:
            name.trim(),

        email:
            email.trim().toLowerCase(),

        password,

        role,

        status:
            "Active"
    };


    users.push(newUser);

    saveUsers(users);


    return {
        success: true,
        user: newUser,
        message:
            "Account created successfully."
    };
}


/* =========================================================
   PASSWORD STRENGTH
   ========================================================= */

export function getPasswordStrength(password) {

    if (!password) {

        return {
            score: 0,
            label: "Empty"
        };
    }


    let score = 0;


    /*
     * Length
     */

    if (password.length >= 6) {
        score++;
    }

    if (password.length >= 10) {
        score++;
    }


    /*
     * Lowercase
     */

    if (/[a-z]/.test(password)) {
        score++;
    }


    /*
     * Uppercase
     */

    if (/[A-Z]/.test(password)) {
        score++;
    }


    /*
     * Number
     */

    if (/[0-9]/.test(password)) {
        score++;
    }


    /*
     * Special character
     */

    if (/[^A-Za-z0-9]/.test(password)) {
        score++;
    }


    let label =
        "Very Weak";


    if (score >= 5) {

        label = "Strong";

    } else if (score >= 4) {

        label = "Good";

    } else if (score >= 2) {

        label = "Medium";

    } else if (score >= 1) {

        label = "Weak";
    }


    return {
        score,
        label
    };
}


/* =========================================================
   SHOW / HIDE PASSWORD
   ========================================================= */

export function togglePasswordVisibility(
    input,
    button
) {

    if (!input) {
        return;
    }


    const isPassword =
        input.type === "password";


    input.type =
        isPassword
            ? "text"
            : "password";


    if (button) {

        const icon =
            button.querySelector("i");


        if (icon) {

            icon.className =
                isPassword
                    ? "fa-solid fa-eye-slash"
                    : "fa-solid fa-eye";
        }


        button.setAttribute(
            "aria-label",
            isPassword
                ? "Hide password"
                : "Show password"
        );
    }
}


/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

export function forgotPassword(email) {

    if (!isRequired(email)) {

        return {
            success: false,
            message: "Email is required."
        };
    }


    if (!isValidEmail(email)) {

        return {
            success: false,
            message:
                "Please enter a valid email address."
        };
    }


    const user =
        findUserByEmail(email);


    if (!user) {

        return {
            success: false,
            message:
                "No account found with this email."
        };
    }


    /*
     * Frontend-only demo token
     */

    const resetToken =
        `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}`;


    saveData(
        "nexora_reset_token",
        {
            email:
                user.email,

            token:
                resetToken,

            expires:
                Date.now() +
                15 * 60 * 1000
        }
    );


    return {
        success: true,
        message:
            "Password reset request created."
    };
}


/* =========================================================
   RESET PASSWORD
   ========================================================= */

export function resetPassword(
    email,
    newPassword,
    confirmPassword
) {

    if (!isRequired(email)) {

        return {
            success: false,
            message: "Email is required."
        };
    }


    if (!isRequired(newPassword)) {

        return {
            success: false,
            message: "New password is required."
        };
    }


    if (newPassword.length < 6) {

        return {
            success: false,
            message:
                "Password must be at least 6 characters."
        };
    }


    if (
        newPassword !==
        confirmPassword
    ) {

        return {
            success: false,
            message:
                "Passwords do not match."
        };
    }


    const users =
        getUsers();


    const userIndex =
        users.findIndex(
            user =>
                user.email.toLowerCase() ===
                email.toLowerCase().trim()
        );


    if (userIndex === -1) {

        return {
            success: false,
            message:
                "Account not found."
        };
    }


    users[userIndex].password =
        newPassword;


    saveUsers(users);


    removeData(
        "nexora_reset_token"
    );


    return {
        success: true,
        message:
            "Password reset successfully."
    };
}


/* =========================================================
   AUTH MESSAGE
   ========================================================= */

export function showAuthMessage(
    message,
    type = "error"
) {

    const containers =
        document.querySelectorAll(
            "#authMessage, .auth-message"
        );


    containers.forEach(container => {

        container.textContent =
            message;

        container.className =
            `auth-message ${type} show`;
    });
}


/* =========================================================
   PASSWORD TOGGLE EVENTS
   ========================================================= */

export function initializePasswordToggles() {

    const buttons =
        document.querySelectorAll(
            ".password-toggle, #passwordToggle"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const targetId =
                    button.dataset.target ||
                    "password";


                const input =
                    document.getElementById(
                        targetId
                    );


                togglePasswordVisibility(
                    input,
                    button
                );
            }
        );
    });
}


/* =========================================================
   LOGIN FORM
   ========================================================= */

export function initializeLoginForm() {

    const form =
        document.querySelector(
            "#loginForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const email =
                form.querySelector(
                    "[name='email']"
                )?.value;


            const password =
                form.querySelector(
                    "[name='password']"
                )?.value;


            const rememberMe =
                form.querySelector(
                    "[name='rememberMe']"
                )?.checked || false;


            const result =
                login(
                    email,
                    password,
                    rememberMe
                );


            if (!result.success) {

                showAuthMessage(
                    result.message,
                    "error"
                );

                return;
            }


            showAuthMessage(
                result.message,
                "success"
            );


            showToast(
                "Welcome back!",
                "success"
            );


            /*
             * Redirect to dashboard
             */

            setTimeout(() => {

                window.location.href =
                    "dashboard.html";

            }, 700);
        }
    );
}


/* =========================================================
   SIGNUP FORM
   ========================================================= */

export function initializeSignupForm() {

    const form =
        document.querySelector(
            "#signupForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const name =
                form.querySelector(
                    "[name='name']"
                )?.value;


            const email =
                form.querySelector(
                    "[name='email']"
                )?.value;


            const password =
                form.querySelector(
                    "[name='password']"
                )?.value;


            const confirmPassword =
                form.querySelector(
                    "[name='confirmPassword']"
                )?.value;


            const result =
                signup({
                    name,
                    email,
                    password,
                    confirmPassword
                });


            if (!result.success) {

                showAuthMessage(
                    result.message,
                    "error"
                );

                return;
            }


            showAuthMessage(
                result.message,
                "success"
            );


            showToast(
                "Account created successfully!",
                "success"
            );


            setTimeout(() => {

                window.location.href =
                    "login.html";

            }, 900);
        }
    );
}


/* =========================================================
   LOGOUT EVENTS
   ========================================================= */

export function initializeLogout() {

    const logoutButtons =
        document.querySelectorAll(
            "#logoutBtn, .logout-btn"
        );


    logoutButtons.forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                logout();
            }
        );
    });
}


/* =========================================================
   INITIALIZE AUTH
   ========================================================= */

export function initAuth() {

    initializeUsers();

    initializePasswordToggles();

    initializeLoginForm();

    initializeSignupForm();

    initializeLogout();
}


/* =========================================================
   DEFAULT EXPORT
   ========================================================= */

export default {

    initializeUsers,
    getUsers,
    findUserByEmail,
    getCurrentUser,
    isLoggedIn,
    login,
    logout,
    signup,
    getPasswordStrength,
    togglePasswordVisibility,
    forgotPassword,
    resetPassword,
    showAuthMessage,
    initializePasswordToggles,
    initializeLoginForm,
    initializeSignupForm,
    initializeLogout,
    initAuth
};