// backend/controllers/dashboardController.js
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const mongoose = require('mongoose'); // Ensure mongoose is imported for ObjectId

// Helper function to calculate start and end of current month (already exists)
const getCurrentMonthDateRange = () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    return { startOfMonth, endOfMonth };
};

// Helper function to calculate start and end of a given period
const getDateRangeForPeriod = (period, year, month = null) => {
    let startDate, endDate;
    const now = new Date(); // Use current date as reference if year/month not provided

    const y = year || now.getFullYear();
    const m = month !== null ? parseInt(month) : now.getMonth();

    switch (period) {
        case 'monthly':
            startDate = new Date(y, m, 1);
            endDate = new Date(y, m + 1, 0);
            break;
        case 'quarterly':
            const quarter = Math.floor(m / 3);
            startDate = new Date(y, quarter * 3, 1);
            endDate = new Date(y, quarter * 3 + 3, 0);
            break;
        case 'annually':
            startDate = new Date(y, 0, 1);
            endDate = new Date(y, 11, 31);
            break;
        default: // Current month as default
            return getCurrentMonthDateRange();
    }
    endDate.setHours(23, 59, 59, 999); // Set to end of day for accurate filtering
    return { startDate, endDate };
};


// @desc    Get dashboard summary data for a user (already exists)
// @route   GET /api/dashboard/summary
// @access  Private
exports.getDashboardSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startOfMonth, endOfMonth } = getCurrentMonthDateRange();

        // 1. Total Income for current month
        const totalIncomeResult = await Income.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId), date: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalIncome = totalIncomeResult.length > 0 ? totalIncomeResult[0].total : 0;

        // 2. Total Expenses for current month
        const totalExpenseResult = await Expense.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId), date: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalExpenses = totalExpenseResult.length > 0 ? totalExpenseResult[0].total : 0;

        // 3. Current Balance (current month)
        const currentMonthBalance = totalIncome - totalExpenses;

        // 4. Budget vs Actual (for current month, if a monthly budget exists)
        const activeMonthlyBudget = await Budget.findOne({
            user: userId,
            period: 'monthly',
            startDate: { $lte: endOfMonth },
            endDate: { $gte: startOfMonth }
        });

        let budgetVsActual = null;
        if (activeMonthlyBudget) {
            const budgetCategories = activeMonthlyBudget.categories.filter(cat => cat.type === 'expense');
            const budgetedExpenseTotal = budgetCategories.reduce((acc, cat) => acc + cat.allocatedAmount, 0);

            const actualExpensesByCategory = await Expense.aggregate([
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(userId),
                        date: { $gte: activeMonthlyBudget.startDate, $lte: activeMonthlyBudget.endDate },
                        category: { $in: budgetCategories.map(cat => cat.name) }
                    }
                },
                { $group: { _id: '$category', totalSpent: { $sum: '$amount' } } }
            ]);

            const actualExpensesMap = new Map();
            actualExpensesByCategory.forEach(item => {
                actualExpensesMap.set(item._id, item.totalSpent);
            });

            const categoryBreakdown = budgetCategories.map(bCat => ({
                category: bCat.name,
                budgeted: bCat.allocatedAmount,
                spent: actualExpensesMap.get(bCat.name) || 0,
                remaining: bCat.allocatedAmount - (actualExpensesMap.get(bCat.name) || 0)
            }));

            const totalActualExpenses = actualExpensesByCategory.reduce((acc, item) => acc + item.totalSpent, 0);

            budgetVsActual = {
                budgetName: activeMonthlyBudget.name,
                budgetPeriod: activeMonthlyBudget.period,
                budgetStartDate: activeMonthlyBudget.startDate,
                budgetEndDate: activeMonthlyBudget.endDate,
                totalBudgetedExpenses: budgetedExpenseTotal,
                totalActualExpenses: totalActualExpenses,
                remainingBudget: budgetedExpenseTotal - totalActualExpenses,
                categoryBreakdown: categoryBreakdown
            };
        }

        // 5. Recent Transactions (last 5 expenses and 5 income, sorted by date)
        const recentExpenses = await Expense.find({ user: userId })
            .sort({ date: -1, createdAt: -1 })
            .limit(5);

        const recentIncome = await Income.find({ user: userId })
            .sort({ date: -1, createdAt: -1 })
            .limit(5);

        const recentTransactions = [...recentExpenses, ...recentIncome]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10);

        res.json({
            totalIncome: totalIncome,
            totalExpenses: totalExpenses,
            currentMonthBalance: currentMonthBalance,
            budgetVsActual: budgetVsActual,
            recentTransactions: recentTransactions
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};


// --- New Reporting Endpoints ---

// @desc    Get expenses by category for a given period
// @route   GET /api/dashboard/reports/expenses-by-category
// @access  Private
// @query   period=monthly/quarterly/annually, year=YYYY, month=MM (optional)
exports.getExpensesByCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { period, year, month } = req.query;
        const { startDate, endDate } = getDateRangeForPeriod(period, year, month);

        const expensesByCategory = await Expense.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$category',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { totalAmount: -1 } } // Sort by highest spending category
        ]);

        res.json({ startDate, endDate, expensesByCategory });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get income by category for a given period
// @route   GET /api/dashboard/reports/income-by-category
// @access  Private
// @query   period=monthly/quarterly/annually, year=YYYY, month=MM (optional)
exports.getIncomeByCategory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { period, year, month } = req.query;
        const { startDate, endDate } = getDateRangeForPeriod(period, year, month);

        const incomeByCategory = await Income.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(userId),
                    date: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: '$category',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { totalAmount: -1 } } // Sort by highest income category
        ]);

        res.json({ startDate, endDate, incomeByCategory });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get daily/monthly/yearly transaction totals for a given period (trend data)
// @route   GET /api/dashboard/reports/transaction-trends
// @access  Private
// @query   type=expense/income, period=monthly/yearly (for grouping), year=YYYY (required for yearly)
exports.getTransactionTrends = async (req, res) => {
    try {
        const userId = req.user.id;
        const { type, period, year } = req.query; // period here refers to the aggregation interval (e.g., 'monthly', 'yearly')

        if (!type || (period === 'yearly' && !year)) {
            return res.status(400).json({ msg: 'Missing type or year for yearly trends.' });
        }

        const Model = type === 'expense' ? Expense : Income;
        const groupFormat = period === 'monthly' ? { $dateToString: { format: '%Y-%m', date: '$date' } } : { $dateToString: { format: '%Y', date: '$date' } };
        const matchQuery = { user: new mongoose.Types.ObjectId(userId) };

        if (year) {
            const startOfYear = new Date(year, 0, 1);
            const endOfYear = new Date(parseInt(year) + 1, 0, 0); // Last day of that year
            endOfYear.setHours(23, 59, 59, 999);
            matchQuery.date = { $gte: startOfYear, $lte: endOfYear };
        }

        const trends = await Model.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: groupFormat,
                    totalAmount: { $sum: '$amount' }
                }
            },
            { $sort: { _id: 1 } } // Sort by date string
        ]);

        res.json({ type, period, year, trends });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};