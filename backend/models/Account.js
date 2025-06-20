// models/Account.js
const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    name: { // e.g., "Cash", "Savings Account", "Credit Card", "Rent Expense", "Salary Income", "Retained Earnings"
        type: String,
        required: true,
        trim: true,
    },
    // Main type of account for financial statement categorization
    accountType: {
        type: String,
        enum: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'],
        required: true,
        message: 'Account type must be one of Asset, Liability, Equity, Revenue, Expense'
    },
    // Sub-type for more granular categorization (optional but good for detailed reports)
    subType: {
        type: String,
        trim: true,
        // Examples: Current Asset, Fixed Asset, Current Liability, Long-term Liability, Owner's Equity, Operating Revenue, Non-Operating Revenue, Operating Expense, Non-Operating Expense
    },
    description: {
        type: String,
        trim: true,
    },
    initialBalance: { // Starting balance for balance sheet accounts (Assets, Liabilities, Equity)
        type: Number,
        default: 0,
    },
    isContraAccount: { // For accounts that reduce the balance of another (e.g., Accumulated Depreciation)
        type: Boolean,
        default: false,
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

// Update `updatedAt` on save
accountSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Account', accountSchema);