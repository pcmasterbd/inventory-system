import { Product, CashTransaction, Customer } from "@/types";

export const mockProducts: Product[] = [
    {
        id: "1",
        name: "Basmati Rice Premium",
        category: "Grocery",
        sku: "GRO-001",
        purchasePrice: 120,
        sellingPrice: 150,
        stock: 500,
        unit: "kg",
        minStockAlert: 50,
        supplier: "City Wholesalers",
        type: "physical"
    },
    {
        id: "2",
        name: "Soybean Oil (5L)",
        category: "Grocery",
        sku: "GRO-002",
        purchasePrice: 800,
        sellingPrice: 850,
        stock: 120,
        unit: "bottle",
        minStockAlert: 20,
        supplier: "Meghna Group",
        type: "physical"
    },
    {
        id: "3",
        name: "ACI Salt",
        category: "Grocery",
        sku: "GRO-003",
        purchasePrice: 35,
        sellingPrice: 45,
        stock: 200,
        unit: "pkt",
        minStockAlert: 30,
        type: "physical"
    }
];

export const mockTransactions: CashTransaction[] = [
    {
        id: "t1",
        date: new Date().toISOString(),
        amount: 5000,
        type: 'income',
        category: 'Sales',
        paymentMethod: 'cash',
        description: 'Daily Counter Sales'
    },
    {
        id: "t2",
        date: new Date(Date.now() - 86400000).toISOString(),
        amount: 2000,
        type: 'expense',
        category: 'Transport',
        paymentMethod: 'bkash',
        description: 'Product delivery charge'
    }
];

export const mockCustomers: Customer[] = [
    {
        id: "c1",
        name: "Rahim Store",
        phone: "01711111111",
        type: "customer",
        balance: 5000,
        address: "Mirpur 10, Dhaka"
    },
    {
        id: "s1",
        name: "City Wholesalers",
        phone: "01822222222",
        type: "supplier",
        balance: -25000, // We owe them
        address: "Kawran Bazar, Dhaka"
    }
];
