// backend/routes/index.js (or wherever you manage your main routes)
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have this

// Import your existing controllers
const userController = require('../controllers/userController');
const budgetController = require('../controllers/budgetController');
const expenseController = require('../controllers/expenseController');
const incomeController = require('../controllers/incomeController');
const accountController = require('../controllers/accountController'); // For account creation/management

// NEW: Import the transaction controller
const transactionController = require('../controllers/transactionController');

// Authentication routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Budget routes (using existing controller, assumed to work with Budget model)
router.get('/budgets', authMiddleware, budgetController.getBudgets);
router.post('/budgets', authMiddleware, budgetController.createBudget);
// ... other budget routes

// Expense routes (using existing controller, assumed to work with Expense model)
router.get('/expenses', authMiddleware, expenseController.getExpenses);
router.post('/expenses', authMiddleware, expenseController.createExpense);
// ... other expense routes

// Income routes (using existing controller, assumed to work with Income model)
router.get('/income', authMiddleware, incomeController.getIncomes);
router.post('/income', authMiddleware, incomeController.createIncome);
// ... other income routes

// Account Management routes (for creating the Asset, Liability, Equity, Revenue, Expense accounts)
router.get('/accounts', authMiddleware, accountController.getAccounts);
router.post('/accounts', authMiddleware, accountController.createAccount); // This needs to be enhanced to support accountType creation
// ... other account routes (e.g., update, delete)

// NEW: Transaction (Double-Entry) routes
router.post('/transactions', authMiddleware, transactionController.createTransaction);
router.get('/transactions', authMiddleware, transactionController.getTransactions);
// ... Add routes for updating/deleting transactions if needed

module.exports = router;