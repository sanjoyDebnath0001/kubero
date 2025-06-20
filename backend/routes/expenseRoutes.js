// backend/routes/expenseRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Our authentication middleware
const expenseController = require('../controllers/expenseController'); // Import the controller
const { check } = require('express-validator'); // For input validation (optional but good practice)

// @route   GET api/expenses
// @desc    Get all expenses for the authenticated user
// @access  Private
router.get('/', auth, expenseController.getExpenses);

// @route   GET api/expenses/:id
// @desc    Get single expense by ID for the authenticated user
// @access  Private
router.get('/:id', auth, expenseController.getExpenseById);

// @route   POST api/expenses
// @desc    Create a new expense
// @access  Private
router.post(
    '/',
    [
        auth,
        [
            check('description', 'Description is required').not().isEmpty(),
            check('amount', 'Amount is required and must be a positive number').isFloat({ gt: 0 }),
            check('date', 'Date is required').isISO8601().toDate(), // Validates date format
            check('category', 'Category is required').not().isEmpty()
        ]
    ],
    expenseController.createExpense
);

// @route   PUT api/expenses/:id
// @desc    Update an existing expense
// @access  Private
router.put(
    '/:id',
    [
        auth,
        [
            // Optional: Add validation for updates too, similar to create
            // For now, we'll let the controller handle missing fields gracefully
        ]
    ],
    expenseController.updateExpense
);

// @route   DELETE api/expenses/:id
// @desc    Delete an expense
// @access  Private
router.delete('/:id', auth, expenseController.deleteExpense);

module.exports = router;