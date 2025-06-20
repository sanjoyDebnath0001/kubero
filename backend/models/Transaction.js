// models/Transaction.js
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    // Type of transaction (e.g., 'expense', 'income', 'transfer', 'journal entry')
    transactionType: {
        type: String,
        enum: ['Expense', 'Income', 'Transfer', 'Journal Entry', 'Initial Balance'],
        default: 'Journal Entry'
    },
    // Array of entries for double-entry bookkeeping
    entries: [
        {
            accountId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Account',
                required: true,
            },
            debit: {
                type: Number,
                default: 0,
                min: 0,
            },
            credit: {
                type: Number,
                default: 0,
                min: 0,
            },
            // Optional: for detailed reporting, categorize this specific entry
            category: { type: String, trim: true },
        }
    ],
    reference: { // Optional: Invoice ID, receipt ID, etc.
        type: String,
        trim: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Validator to ensure total debits equal total credits for each transaction
transactionSchema.path('entries').validate(function (entries) {
    const totalDebits = entries.reduce((sum, entry) => sum + entry.debit, 0);
    const totalCredits = entries.reduce((sum, entry) => sum + entry.credit, 0);
    return totalDebits === totalCredits;
}, 'Total debits must equal total credits for a transaction.');

// Update `updatedAt` on save
transactionSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Transaction', transactionSchema);