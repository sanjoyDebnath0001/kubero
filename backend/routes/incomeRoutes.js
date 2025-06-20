// backend/routes/incomeRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Our authentication middleware
const incomeController = require('../controllers/incomeController'); // Import the controller
const { check } = require('express-validator'); // For input validation

// @route   GET api/income
// @desc    Get all income entries for the authenticated user
// @access  Private
router.get('/', auth, incomeController.getIncome);

// @route   GET api/income/:id
// @desc    Get single income entry by ID for the authenticated user
// @access  Private
router.get('/:id', auth, incomeController.getIncomeById);

// @route   POST api/income
// @desc    Create a new income entry
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
    incomeController.createIncome
);

// @route   PUT api/income/:id
// @desc    Update an existing income entry
// @access  Private
router.put(
    '/:id',
    [
        auth,
        // Add validation for updates here if needed, similar to create
    ],
    incomeController.updateIncome
);

// @route   DELETE api/income/:id
// @desc    Delete an income entry
// @access  Private
router.delete('/:id', auth, incomeController.deleteIncome);

module.exports = router;