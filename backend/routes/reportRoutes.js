// backend/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Our authentication middleware
const reportController = require('../controllers/reportController'); // Import the controller

// @route   GET /api/reports/spending-by-category
// @desc    Get spending by category report for a given period
// @access  Private
// Query Params: startDate (YYYY-MM-DD), endDate (YYYY-MM-DD)
router.get('/spending-by-category', auth, reportController.getSpendingByCategory);

// @route   GET /api/reports/income-by-category
// @desc    Get income by category report for a given period
// @access  Private
// Query Params: startDate (YYYY-MM-DD), endDate (YYYY-MM-DD)
router.get('/income-by-category', auth, reportController.getIncomeByCategory);

// @route   GET /api/reports/net-income
// @desc    Get net income/loss report for a given period
// @access  Private
// Query Params: startDate (YYYY-MM-DD), endDate (YYYY-MM-DD)
router.get('/net-income', auth, reportController.getNetIncomeReport);

module.exports = router;