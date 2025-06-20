// backend/controllers/reportController.js
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const mongoose = require('mongoose'); // Ensure mongoose is imported for ObjectId

// Helper function to validate and parse date ranges
const parseDateRange = (startDateStr, endDateStr) => {
    const startDate = startDateStr ? new Date(startDateStr) : null;
    const endDate = endDateStr ? new Date(endDateStr) : null;

    if (startDate && isNaN(startDate.getTime())) {
        throw new Error('Invalid start date.');
    }
    if (endDate && isNaN(endDate.getTime())) {
        throw new Error('Invalid end date.');
    }

    // Adjust endDate to end of day for inclusive filtering
    if (endDate) {
        endDate.setHours(23, 59, 59, 999);
    }

    return { startDate, endDate };
};

// @desc    Get spending by category report
// @route   GET /api/reports/spending-by-category
// @access  Private
exports.getSpendingByCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate } = parseDateRange(req.query.startDate, req.query.endDate);

        const matchStage = {
            user: mongoose.Types.ObjectId(userId)
        };

        if (startDate && endDate) {
            matchStage.date = { $gte: startDate, $lte: endDate };
        } else if (startDate) {
            matchStage.date = { $gte: startDate };
        } else if (endDate) {
            matchStage.date = { $lte: endDate };
        }

        const report = await Expense.aggregate([
            { $match: matchStage },
            { $group: { _id: '$category', totalSpent: { $sum: '$amount' } } },
            { $sort: { totalSpent: -1 } }
        ]);

        res.json(report);
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ msg: err.message || 'Server Error' });
    }
};

// @desc    Get income by category report
// @route   GET /api/reports/income-by-category
// @access  Private
exports.getIncomeByCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate } = parseDateRange(req.query.startDate, req.query.endDate);

        const matchStage = {
            user: mongoose.Types.ObjectId(userId)
        };

        if (startDate && endDate) {
            matchStage.date = { $gte: startDate, $lte: endDate };
        } else if (startDate) {
            matchStage.date = { $gte: startDate };
        } else if (endDate) {
            matchStage.date = { $lte: endDate };
        }

        const report = await Income.aggregate([
            { $match: matchStage },
            { $group: { _id: '$category', totalReceived: { $sum: '$amount' } } },
            { $sort: { totalReceived: -1 } }
        ]);

        res.json(report);
    } catch (err) {
        console.error(err.message);
        res.status(400).json({ msg: err.message || 'Server Error' });
    }
};

// @desc    Get net income/loss report for a period
// @route   GET /api/reports/net-income
// @access  Private
exports.getNetIncomeReport = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startDate, endDate } = parseDateRange(req.query.startDate, req.query.endDate);

        const matchStage = {
            user: mongoose.Types.ObjectId(userId)
        };

        if (startDate && endDate) {
            matchStage.date = { $gte: startDate, $lte: endDate };
        } else if (startDate) {
            matchStage.date = { $gte: startDate };
        } else if (endDate) {
            matchStage.date = { $lte: endDate };
        }

        // Calculate total income for the period
        const totalIncomeResult = await Income.aggregate([
            { $match: matchStage },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalIncome = totalIncomeResult.length > 0 ? totalIncomeResult[0].total : 0;

        // Calculate total expenses for the period
        const totalExpenseResult = await Expense.aggregate([
            { $match: matchStage },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalExpenses = totalExpenseResult.length > 0 ? totalExpenseResult[0].total : 0;

        const netIncome = totalIncome - totalExpenses;

        res.json({
            startDate: startDate ? startDate.toISOString().split('T')[0] : null,
            endDate: endDate ? endDate.toISOString().split('T')[0] : null,
            totalIncome,
            totalExpenses,
            netIncome
        });

    } catch (err) {
        console.error(err.message);
        res.status(400).json({ msg: err.message || 'Server Error' });
    }
};