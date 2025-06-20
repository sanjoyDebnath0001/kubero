// backend/models/Income.js
const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        required: true
    },
    description: {
        type: String,
        required: [true, 'Income description is required'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Income amount is required'],
        min: 0.01 // Ensures a positive amount
    },
    date: {
        type: Date,
        required: [true, 'Income date is required'],
        default: Date.now // Default to current date if not provided
    },
    category: {
        type: String,
        required: [true, 'Income category is required'],
        trim: true
    },
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
IncomeSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Income', IncomeSchema);