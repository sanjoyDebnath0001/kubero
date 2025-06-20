// frontend/src/components/IncomeManager.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Card, Button, Form, Alert, Row, Col, ListGroup } from 'react-bootstrap';
import { FaEdit, FaTrashAlt, FaPlusCircle } from 'react-icons/fa'; // Ensure react-icons is installed
import axiosInstance from '../setting/axiosInstance';

const IncomeManager = () => {
    const [incomeEntries, setIncomeEntries] = useState([]);
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        date: '',
        category: '',
        notes: ''
    });
    const [editMode, setEditMode] = useState(false);
    const [currentIncomeId, setCurrentIncomeId] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const { description, amount, date, category, notes } = formData;

    useEffect(() => {
        fetchIncome();
    }, []);

    const fetchIncome = async () => {
        setError('');
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { 'x-auth-token': token }
            };
            const res = await axiosInstance.get('/income', config);
            setIncomeEntries(res.data);
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to fetch income entries.');
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
                await axiosInstance.put(`/income/${currentIncomeId}`, formData, config);
                setMessage('Income entry updated successfully!');
            } else {
                await axiosInstance.post('/income', formData, config);
                setMessage('Income entry created successfully!');
            }
            resetForm();
            fetchIncome(); // Refresh the list
        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.errors?.[0]?.msg || 'Error saving income entry.');
            console.error(err);
        }
    };

    const onEdit = (incomeEntry) => {
        setFormData({
            description: incomeEntry.description,
            amount: incomeEntry.amount,
            date: incomeEntry.date.split('T')[0], // Format date for input
            category: incomeEntry.category,
            notes: incomeEntry.notes
        });
        setEditMode(true);
        setCurrentIncomeId(incomeEntry._id);
        setMessage('');
        setError('');
    };

    const onDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this income entry?')) {
            setError('');
            setMessage('');
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: { 'x-auth-token': token }
                };
                await axiosInstance.delete(`/income/${id}`, config);
                setMessage('Income entry deleted successfully!');
                fetchIncome();
            } catch (err) {
                setError(err.response?.data?.msg || 'Failed to delete income entry.');
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
        setCurrentIncomeId(null);
    };

    return (
        <Container className="mt-5">
            <Card className="mb-4">
                <Card.Body>
                    <h2 className="text-center mb-4">{editMode ? 'Edit Income Entry' : 'Add New Income Entry'}</h2>
                    {message && <Alert variant="success">{message}</Alert>}
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={onSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="incomeDescription">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g., Monthly Salary, Freelance Payment"
                                        name="description"
                                        value={description}
                                        onChange={onChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="incomeAmount">
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
                                <Form.Group className="mb-3" controlId="incomeDate">
                                    <Form.Label>Date Received</Form.Label>
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
                                <Form.Group className="mb-3" controlId="incomeCategory">
                                    <Form.Label>Category</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="e.g., Salary, Investments, Gift"
                                        name="category"
                                        value={category}
                                        onChange={onChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3" controlId="incomeNotes">
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
                                {editMode ? 'Update Income' : 'Add Income'}
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

            <h2 className="mt-5 mb-4 text-center">My Income</h2>
            {incomeEntries.length === 0 ? (
                <Alert variant="info" className="text-center">No income recorded. Start by adding one!</Alert>
            ) : (
                <ListGroup className="mb-4">
                    {incomeEntries.map(incomeEntry => (
                        <ListGroup.Item key={incomeEntry._id} className="d-flex justify-content-between align-items-center">
                            <div>
                                <h5>{incomeEntry.description} <span className="badge bg-secondary">{incomeEntry.category}</span></h5>
                                <p className="mb-1 text-muted">
                                    {new Date(incomeEntry.date).toLocaleDateString()}
                                    {incomeEntry.notes && ` | Notes: ${incomeEntry.notes}`}
                                </p>
                            </div>
                            <div className="text-end">
                                <h4 className="text-success mb-1">+${incomeEntry.amount.toFixed(2)}</h4>
                                <div>
                                    <Button variant="info" size="sm" className="me-2" onClick={() => onEdit(incomeEntry)}>
                                        <FaEdit />
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={() => onDelete(incomeEntry._id)}>
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

export default IncomeManager;