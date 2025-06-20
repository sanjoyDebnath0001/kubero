// backend/controllers/incomeController.js
const Income = require('../models/Income');

// @desc    Get all income entries for a user
// @route   GET /api/income
// @access  Private
exports.getIncome = async (req, res) => {
    try {
        const income = await Income.find({ user: req.user.id }).sort({ date: -1, createdAt: -1 });
        res.json(income);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get single income entry by ID for a user
// @route   GET /api/income/:id
// @access  Private
exports.getIncomeById = async (req, res) => {
    try {
        const income = await Income.findById(req.params.id);

        if (!income) {
            return res.status(404).json({ msg: 'Income entry not found' });
        }

        // Ensure income belongs to the logged-in user
        if (income.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized to view this income entry' });
        }

        res.json(income);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Income ID' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Create a new income entry
// @route   POST /api/income
// @access  Private
exports.createIncome = async (req, res) => {
    const { description, amount, date, category, notes } = req.body;

    try {
        const newIncome = new Income({
            user: req.user.id, // Comes from auth middleware
            description,
            amount,
            date,
            category,
            notes
        });

        const income = await newIncome.save();
        res.status(201).json(income); // 201 Created
    } catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Update an existing income entry
// @route   PUT /api/income/:id
// @access  Private
exports.updateIncome = async (req, res) => {
    const { description, amount, date, category, notes } = req.body;

    try {
        let income = await Income.findById(req.params.id);

        if (!income) {
            return res.status(404).json({ msg: 'Income entry not found' });
        }

        // Ensure income belongs to the logged-in user
        if (income.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized to update this income entry' });
        }

        // Update fields
        income.description = description || income.description;
        income.amount = amount !== undefined ? amount : income.amount; // Allow 0 to be a valid update (though min:0.01 prevents it)
        income.date = date || income.date;
        income.category = category || income.category;
        income.notes = notes || income.notes;

        await income.save();
        res.json(income);

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Income ID' });
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({ msg: err.message });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Delete an income entry
// @route   DELETE /api/income/:id
// @access  Private
exports.deleteIncome = async (req, res) => {
    try {
        const income = await Income.findById(req.params.id);

        if (!income) {
            return res.status(404).json({ msg: 'Income entry not found' });
        }

        // Ensure income belongs to the logged-in user
        if (income.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized to delete this income entry' });
        }

        await Income.deleteOne({ _id: req.params.id });

        res.json({ msg: 'Income entry removed' });

    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ msg: 'Invalid Income ID' });
        }
        res.status(500).send('Server Error');
    }
};