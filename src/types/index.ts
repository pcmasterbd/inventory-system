export type TransactionStatus = 'completed' | 'pending' | 'cancelled';
export type PaymentMethod = 'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank';

export interface Product {
    id: string;
    name: string;
    category: string;
    sku: string;
    purchasePrice: number;
    sellingPrice: number;
    stock: number;
    unit: string; // pcs, kg, litre
    supplier?: string;
    minStockAlert: number;
    type: 'physical' | 'digital';
}

export interface CashTransaction {
    id: string;
    date: string; // ISO String
    amount: number;
    type: 'income' | 'expense';
    category: string;
    description?: string;
    paymentMethod: PaymentMethod;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    address?: string;
    type: 'customer' | 'supplier';
    balance: number; // Positive = Receivable, Negative = Payable
}
