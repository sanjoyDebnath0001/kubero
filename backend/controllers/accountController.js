// backend/controllers/accountController.js (Modified - example for createAccount)
const Account = require('../models/Account');


exports.createAccount = async (req, res) => {
    const { name, accountType, subType, initialBalance, description } = req.body;
    const userId = req.user.id; // From authMiddleware

    try {
        if (!name || !accountType) {
            return res.status(400).json({ message: 'Account name and type are required.' });
        }
        if (!['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].includes(accountType)) {
             return res.status(400).json({ message: 'Invalid account type provided.' });
        }

        // Check if an account with the same name and type already exists for the user
        const existingAccount = await Account.findOne({ userId, name, accountType });
        if (existingAccount) {
            return res.status(409).json({ message: `An account named "${name}" of type "${accountType}" already exists.` });
        }

        const newAccount = new Account({
            userId,
            name,
            accountType,
            subType: subType || null,
            initialBalance: initialBalance || 0, // Only relevant for Balance Sheet accounts
            description: description || null,
        });

        await newAccount.save();
        res.status(201).json({ message: 'Account created successfully', account: newAccount });

    } catch (error) {
        console.error('Error creating account:', error);
        res.status(500).json({ message: 'Server error creating account', error: error.message });
    }
};

// You should also have getAccounts to fetch all accounts for a user
exports.getAccounts = async (req, res) => {
    try {
        const accounts = await Account.find({ userId: req.user.id }).sort({ name: 1 });
        res.json(accounts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
// ... other functions like updateAccount, deleteAccount