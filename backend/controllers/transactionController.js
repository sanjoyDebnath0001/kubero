// backend/controllers/transactionController.js
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');

// @desc    Create a new double-entry transaction (Journal Entry)
// @route   POST /api/transactions
// @access  Private (Requires authentication and potentially specific roles)
exports.createTransaction = async (req, res) => {
    const { date, description, transactionType, entries } = req.body;
    const userId = req.user.id; // Assuming user ID is available from authentication middleware

    try {
        // 1. Basic input validation
        if (!date || !description || !entries || entries.length < 2) {
            return res.status(400).json({ message: 'Date, description, and at least two entries are required for a transaction.' });
        }

        // 2. Validate entries: Ensure accountIds are valid and amounts are non-negative
        let totalDebits = 0;
        let totalCredits = 0;
        const validEntries = [];

        for (const entry of entries) {
            const { accountId, debit, credit } = entry;

            if (!accountId || (debit === undefined && credit === undefined) || (debit < 0 || credit < 0)) {
                return res.status(400).json({ message: 'Each entry must have an accountId and non-negative debit/credit.' });
            }

            // Verify accountId belongs to the user and exists
            const account = await Account.findOne({ _id: accountId, userId: userId });
            if (!account) {
                return res.status(404).json({ message: `Account with ID ${accountId} not found or does not belong to user.` });
            }

            // Ensure only one of debit or credit is specified (or both are 0)
            if ((debit > 0 && credit > 0) || (debit === 0 && credit === 0 && (debit !== undefined && credit !== undefined))) {
                return res.status(400).json({ message: `Transaction entry for account ${account.name} must have either a debit OR a credit, not both or neither.` });
            }
            if (debit === undefined) entry.debit = 0;
            if (credit === undefined) entry.credit = 0;


            totalDebits += entry.debit;
            totalCredits += entry.credit;

            validEntries.push({
                accountId: account._id,
                debit: entry.debit,
                credit: entry.credit,
                category: entry.category // Keep category if needed for specific entry
            });
        }

        // 3. Ensure debits equal credits
        if (totalDebits !== totalCredits) {
            return res.status(400).json({ message: `Total debits (${totalDebits}) must equal total credits (${totalCredits}) for the transaction.` });
        }

        // 4. Create the Transaction document
        const newTransaction = new Transaction({
            userId: userId,
            date: new Date(date),
            description: description,
            transactionType: transactionType || 'Journal Entry', // Default to 'Journal Entry'
            entries: validEntries,
        });

        await newTransaction.save();
        res.status(201).json({ message: 'Transaction created successfully', transaction: newTransaction });

    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ message: 'Server error creating transaction', error: error.message });
    }
};

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id })
            .populate('entries.accountId', 'name accountType') // Populate account details for each entry
            .sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Add other CRUD operations (get by ID, update, delete) as needed
// For update/delete, carefully consider implications on account balances.
// A simple delete of a transaction might require reversing its effects.