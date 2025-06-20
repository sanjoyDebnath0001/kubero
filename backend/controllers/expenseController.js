// backend/controllers/expenseController.js
const Expense = require('../models/Expense');

// @desc    Get all expenses for a user
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1, createdAt: -1 });
        res.json(expenses);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get single expense by ID for a user
// @route   GET /api/expenses/:id
// @access  Private
exports.getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ msg: 'Expense not found' });
        }

        // Ensure expense belongs to the logged-in user
        if (expense.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized to view this expense' });
        }

        res.json(expense);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Expense ID' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res) => {
    const { description, amount, date, category, notes } = req.body;

    try {
        const newExpense = new Expense({
            user: req.user.id, // Comes from auth middleware
            description,
            amount,
            date,
            category,
            notes
        });

        const expense = await newExpense.save();
        res.status(201).json(expense); // 201 Created
    } catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Update an existing expense
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res) => {
    const { description, amount, date, category, notes } = req.body;

    try {
        let expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ msg: 'Expense not found' });
        }

        // Ensure expense belongs to the logged-in user
        if (expense.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized to update this expense' });
        }

        // Update fields
        expense.description = description || expense.description;
        expense.amount = amount !== undefined ? amount : expense.amount; // Allow 0 to be a valid update
        expense.date = date || expense.date;
        expense.category = category || expense.category;
        expense.notes = notes || expense.notes;

        await expense.save();
        res.json(expense);

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Expense ID' });
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ msg: 'Expense not found' });
        }

        // Ensure expense belongs to the logged-in user
        if (expense.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized to delete this expense' });
        }

        await Expense.deleteOne({ _id: req.params.id });

        res.json({ msg: 'Expense removed' });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Expense ID' });
        }
        res.status(500).send('Server Error');
    }
};