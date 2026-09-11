/* =========================================================
   NEXORA ERP
   DUMMY DATA
   Initial Demo Data
   ========================================================= */


/* =========================================================
   EMPLOYEES
   ========================================================= */

export const employees = [
    {
        id: 1,
        employeeId: "EMP-001",
        name: "Rakibul Islam",
        email: "rakib@nexora.com",
        phone: "+880 1711-000001",
        department: "Management",
        position: "General Manager",
        salary: 65000,
        joiningDate: "2024-01-15",
        status: "Active"
    },
    {
        id: 2,
        employeeId: "EMP-002",
        name: "Sakib Ahmed",
        email: "sakib@nexora.com",
        phone: "+880 1711-000002",
        department: "Sales",
        position: "Sales Executive",
        salary: 42000,
        joiningDate: "2024-03-10",
        status: "Active"
    },
    {
        id: 3,
        employeeId: "EMP-003",
        name: "Nusrat Jahan",
        email: "nusrat@nexora.com",
        phone: "+880 1711-000003",
        department: "HR",
        position: "HR Executive",
        salary: 45000,
        joiningDate: "2024-04-05",
        status: "Active"
    },
    {
        id: 4,
        employeeId: "EMP-004",
        name: "Tanvir Hasan",
        email: "tanvir@nexora.com",
        phone: "+880 1711-000004",
        department: "IT",
        position: "Software Developer",
        salary: 58000,
        joiningDate: "2024-06-12",
        status: "Active"
    },
    {
        id: 5,
        employeeId: "EMP-005",
        name: "Jannatul Ferdous",
        email: "jannat@nexora.com",
        phone: "+880 1711-000005",
        department: "Finance",
        position: "Accountant",
        salary: 48000,
        joiningDate: "2023-11-20",
        status: "Inactive"
    }
];


/* =========================================================
   CUSTOMERS
   ========================================================= */

export const customers = [
    {
        id: 1,
        customerId: "CUS-001",
        name: "Ahmed Rahman",
        email: "ahmed@example.com",
        phone: "+880 1811-000001",
        address: "Dhaka, Bangladesh",
        totalOrders: 12,
        totalSpent: 125000,
        status: "Active"
    },
    {
        id: 2,
        customerId: "CUS-002",
        name: "Fahim Chowdhury",
        email: "fahim@example.com",
        phone: "+880 1811-000002",
        address: "Chittagong, Bangladesh",
        totalOrders: 8,
        totalSpent: 87500,
        status: "Active"
    },
    {
        id: 3,
        customerId: "CUS-003",
        name: "Mim Akter",
        email: "mim@example.com",
        phone: "+880 1811-000003",
        address: "Sylhet, Bangladesh",
        totalOrders: 5,
        totalSpent: 54000,
        status: "Active"
    },
    {
        id: 4,
        customerId: "CUS-004",
        name: "Nayeem Hasan",
        email: "nayeem@example.com",
        phone: "+880 1811-000004",
        address: "Rajshahi, Bangladesh",
        totalOrders: 3,
        totalSpent: 28000,
        status: "Inactive"
    },
    {
        id: 5,
        customerId: "CUS-005",
        name: "Sumaiya Islam",
        email: "sumaiya@example.com",
        phone: "+880 1811-000005",
        address: "Khulna, Bangladesh",
        totalOrders: 9,
        totalSpent: 92000,
        status: "Active"
    }
];


/* =========================================================
   PRODUCTS
   ========================================================= */

export const products = [
    {
        id: 1,
        sku: "PRD-001",
        name: "Wireless Keyboard",
        category: "Electronics",
        sellingPrice: 1850,
        costPrice: 1300,
        quantity: 45,
        minimumStock: 10,
        status: "Active",
        image: "",
        description: "Comfortable wireless keyboard for everyday use."
    },
    {
        id: 2,
        sku: "PRD-002",
        name: "Wireless Mouse",
        category: "Electronics",
        sellingPrice: 950,
        costPrice: 600,
        quantity: 8,
        minimumStock: 10,
        status: "Active",
        image: "",
        description: "Ergonomic wireless mouse with precise tracking."
    },
    {
        id: 3,
        sku: "PRD-003",
        name: "USB-C Hub",
        category: "Accessories",
        sellingPrice: 2200,
        costPrice: 1500,
        quantity: 24,
        minimumStock: 8,
        status: "Active",
        image: "",
        description: "Multi-port USB-C hub for laptops and devices."
    },
    {
        id: 4,
        sku: "PRD-004",
        name: "Laptop Stand",
        category: "Accessories",
        sellingPrice: 1650,
        costPrice: 1050,
        quantity: 0,
        minimumStock: 5,
        status: "Active",
        image: "",
        description: "Adjustable aluminum laptop stand."
    },
    {
        id: 5,
        sku: "PRD-005",
        name: "Mechanical Keyboard",
        category: "Electronics",
        sellingPrice: 4200,
        costPrice: 3100,
        quantity: 18,
        minimumStock: 5,
        status: "Active",
        image: "",
        description: "Mechanical keyboard with RGB lighting."
    },
    {
        id: 6,
        sku: "PRD-006",
        name: "Webcam HD",
        category: "Electronics",
        sellingPrice: 3200,
        costPrice: 2300,
        quantity: 6,
        minimumStock: 8,
        status: "Active",
        image: "",
        description: "Full HD webcam for meetings and streaming."
    }
];


/* =========================================================
   SALES
   ========================================================= */

export const sales = [
    {
        id: 1,
        invoiceNumber: "INV-1001",
        customerId: 1,
        customerName: "Ahmed Rahman",
        date: "2026-09-01",
        subtotal: 5000,
        discount: 250,
        vat: 712.5,
        total: 5462.5,
        status: "Paid"
    },
    {
        id: 2,
        invoiceNumber: "INV-1002",
        customerId: 2,
        customerName: "Fahim Chowdhury",
        date: "2026-09-03",
        subtotal: 8200,
        discount: 400,
        vat: 1170,
        total: 8970,
        status: "Paid"
    },
    {
        id: 3,
        invoiceNumber: "INV-1003",
        customerId: 3,
        customerName: "Mim Akter",
        date: "2026-09-05",
        subtotal: 3600,
        discount: 100,
        vat: 525,
        total: 4025,
        status: "Pending"
    },
    {
        id: 4,
        invoiceNumber: "INV-1004",
        customerId: 5,
        customerName: "Sumaiya Islam",
        date: "2026-09-08",
        subtotal: 7400,
        discount: 300,
        vat: 1065,
        total: 8165,
        status: "Paid"
    }
];


/* =========================================================
   EXPENSES
   ========================================================= */

export const expenses = [
    {
        id: 1,
        title: "Office Rent",
        category: "Office",
        amount: 45000,
        date: "2026-09-01",
        status: "Paid"
    },
    {
        id: 2,
        title: "Electricity Bill",
        category: "Utilities",
        amount: 8500,
        date: "2026-09-04",
        status: "Paid"
    },
    {
        id: 3,
        title: "Internet Bill",
        category: "Utilities",
        amount: 3000,
        date: "2026-09-05",
        status: "Paid"
    },
    {
        id: 4,
        title: "Office Supplies",
        category: "Supplies",
        amount: 7200,
        date: "2026-09-07",
        status: "Paid"
    }
];


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

export const notifications = [
    {
        id: 1,
        type: "warning",
        title: "Low Stock Alert",
        message: "Wireless Mouse stock is below minimum level.",
        time: "10 minutes ago",
        read: false
    },
    {
        id: 2,
        type: "danger",
        title: "Out of Stock",
        message: "Laptop Stand is currently out of stock.",
        time: "25 minutes ago",
        read: false
    },
    {
        id: 3,
        type: "success",
        title: "New Order",
        message: "A new order has been created successfully.",
        time: "1 hour ago",
        read: true
    },
    {
        id: 4,
        type: "info",
        title: "System Update",
        message: "NEXORA ERP dashboard data has been updated.",
        time: "2 hours ago",
        read: true
    }
];


/* =========================================================
   CURRENT USER
   ========================================================= */

export const currentUser = {
    id: 1,
    name: "Rakibul Islam",
    email: "rakib@nexora.com",
    role: "Admin",
    avatar: ""
};


/* =========================================================
   DASHBOARD MONTHLY DATA
   ========================================================= */

export const monthlyPerformance = [
    {
        month: "January",
        revenue: 185000,
        sales: 42,
        expenses: 92000
    },
    {
        month: "February",
        revenue: 210000,
        sales: 48,
        expenses: 98000
    },
    {
        month: "March",
        revenue: 195000,
        sales: 45,
        expenses: 87000
    },
    {
        month: "April",
        revenue: 240000,
        sales: 56,
        expenses: 105000
    },
    {
        month: "May",
        revenue: 265000,
        sales: 62,
        expenses: 112000
    },
    {
        month: "June",
        revenue: 285000,
        sales: 68,
        expenses: 118000
    },
    {
        month: "July",
        revenue: 310000,
        sales: 74,
        expenses: 125000
    },
    {
        month: "August",
        revenue: 335000,
        sales: 81,
        expenses: 132000
    },
    {
        month: "September",
        revenue: 420000,
        sales: 94,
        expenses: 157000
    }
];


/* =========================================================
   INVENTORY HISTORY
   ========================================================= */

export const inventoryHistory = [
    {
        id: 1,
        productId: 1,
        productName: "Wireless Keyboard",
        type: "Stock In",
        quantity: 20,
        date: "2026-09-01",
        reference: "PUR-001"
    },
    {
        id: 2,
        productId: 2,
        productName: "Wireless Mouse",
        type: "Stock Out",
        quantity: 5,
        date: "2026-09-03",
        reference: "INV-1002"
    },
    {
        id: 3,
        productId: 3,
        productName: "USB-C Hub",
        type: "Stock In",
        quantity: 15,
        date: "2026-09-04",
        reference: "PUR-002"
    },
    {
        id: 4,
        productId: 4,
        productName: "Laptop Stand",
        type: "Stock Out",
        quantity: 4,
        date: "2026-09-06",
        reference: "INV-1003"
    }
];