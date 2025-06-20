// backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Our authentication middleware
const dashboardController = require('../controllers/dashboardController'); // Import the controller

// @route   GET api/dashboard/summary
// @desc    Get summary data for the dashboard
// @access  Private
router.get('/summary', auth, dashboardController.getDashboardSummary);

// @route   GET /api/dashboard/reports/expenses-by-category
// @desc    Get expenses by category for a given period
// @access  Private
router.get('/reports/expenses-by-category', auth, dashboardController.getExpensesByCategory);

// @route   GET /api/dashboard/reports/income-by-category
// @desc    Get income by category for a given period
// @access  Private
router.get('/reports/income-by-category', auth, dashboardController.getIncomeByCategory);

// @route   GET /api/dashboard/reports/transaction-trends
// @desc    Get daily/monthly/yearly transaction totals for a given period (trend data)
// @access  Private
router.get('/reports/transaction-trends', auth, dashboardController.getTransactionTrends);

module.exports = router;