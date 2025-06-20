// backend/models/Expense.js
const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    description: {
        type: String,
        required: [true, 'Expense description is required'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Expense amount is required'],
        min: 0.01 // Ensures a positive amount
    },
    date: {
        type: Date,
        required: [true, 'Expense date is required'],
        default: Date.now // Default to current date if not provided
    },
    category: {
        type: String,
        required: [true, 'Expense category is required'],
        trim: true
    },
    // Optional: Reference to a specific budget (future integration)
    // budget: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Budget',
    //     required: false // Not required for now, can be added later
    // },
    notes: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Pre-save hook to update updatedAt timestamp
ExpenseSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});


module.exports = mongoose.model('Expense', ExpenseSchema);