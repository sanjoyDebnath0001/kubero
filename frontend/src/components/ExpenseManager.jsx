// frontend/src/components/ExpenseManager.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Button, Form, Alert, Row, Col, ListGroup } from 'react-bootstrap';
import { FaEdit, FaTrashAlt, FaPlusCircle } from 'react-icons/fa'; // react-icon
import axiosInstance from '../setting/axiosInstance';

const ExpenseManager = () => {
    const [expenses, setExpenses] = useState([]);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        date: '',
        category: '',
        notes: ''
    });
    const [editMode, setEditMode] = useState(false);
    const [currentExpenseId, setCurrentExpenseId] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const { description, amount, date, category, notes } = formData;

    useEffect(() => {
        fetchExpenses();
    }, []);

    const fetchExpenses = async () => {
        setError('');
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { 'x-auth-token': token }
            };
            const res = await axiosInstance.get('/api/expenses', config);
            setExpenses(res.data);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to fetch expenses.');
            console.error(err);
        }
    };

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                }
            };

            if (editMode) {
                await axiosInstance.put(`/expenses/${currentExpenseId}`, formData, config);
                setMessage('Expense updated successfully!');
            } else {
                await axiosInstance.post('/expenses', formData, config);
                setMessage('Expense created successfully!');
            }
            resetForm();
            fetchExpenses(); // Refresh the list
        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Error saving expense.');
            console.error(err);
        }
    };

    const onEdit = (expense) => {
        setFormData({
            description: expense.description,
            amount: expense.amount,
            date: expense.date.split('T')[0], // Format date for input
            category: expense.category,
            notes: expense.notes
        });
        setEditMode(true);
        setCurrentExpenseId(expense._id);
        setMessage('');
        setError('');
    };

    const onDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            setError('');
            setMessage('');
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { 'x-auth-token': token }
                };
                await axiosInstance.delete(`/expenses/${id}`, config);
                setMessage('Expense deleted successfully!');
                fetchExpenses();
            } catch (err) {
                setError(err.response?.data?.msg || 'Failed to delete expense.');
                console.error(err);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            description: '',
            amount: '',
            date: '',
            category: '',
            notes: ''
        });
        setEditMode(false);
        setCurrentExpenseId(null);
    };

    return (
        <Container className="mt-5">
            <Card className="mb-4">
                <Card.Body>
                    <h2 className="text-center mb-4">{editMode ? 'Edit Expense' : 'Add New Expense'}</h2>
                    {message && <Alert variant="success">{message}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={onSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="expenseDescription">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g., Groceries, Dinner with friends"
                                        name="description"
                                        value={description}
                                        onChange={onChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="expenseAmount">
                                    <Form.Label>Amount ($)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        name="amount"
                                        value={amount}
                                        onChange={onChange}
                                        min="0.01"
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="expenseDate">
                                    <Form.Label>Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="date"
                                        value={date}
                                        onChange={onChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="expenseCategory">
                                    <Form.Label>Category</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g., Food, Transport, Utilities"
                                        name="category"
                                        value={category}
                                        onChange={onChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3" controlId="expenseNotes">
                            <Form.Label>Notes (Optional)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Any additional details"
                                name="notes"
                                value={notes}
                                onChange={onChange}
                            />
                        </Form.Group>

                        <div className="d-grid gap-2">
                            <Button variant="success" type="submit">
                                {editMode ? 'Update Expense' : 'Add Expense'}
                            </Button>
                            {editMode && (
                                <Button variant="secondary" onClick={resetForm}>
                                    Cancel Edit
                                </Button>
                            )}
                        </div>
                    </Form>
                </Card.Body>
            </Card>

            <h2 className="mt-5 mb-4 text-center">My Expenses</h2>
            {expenses.length === 0 ? (
                <Alert variant="info" className="text-center">No expenses recorded. Start by adding one!</Alert>
            ) : (
                <ListGroup className="mb-4">
                    {expenses.map(expense => (
                        <ListGroup.Item key={expense._id} className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5>{expense.description} <span className="badge bg-secondary">{expense.category}</span></h5>
                                <p className="mb-1 text-muted">
                                    {new Date(expense.date).toLocaleDateString()}
                                    {expense.notes && ` | Notes: ${expense.notes}`}
                                </p>
                            </div>
                            <div className="text-end">
                                <h4 className="text-danger mb-1">${expense.amount.toFixed(2)}</h4>
                                <div>
                                    <Button variant="info" size="sm" className="me-2" onClick={() => onEdit(expense)}>
                                        <FaEdit />
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={() => onDelete(expense._id)}>
                                        <FaTrashAlt />
                                    </Button>
                                </div>
                            </div>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            )}
        </Container>
    );
};

export default ExpenseManager;