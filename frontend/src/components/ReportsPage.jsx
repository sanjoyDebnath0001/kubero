// frontend/src/components/ReportsPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Container, Card, Button, Form, Alert, Row, Col, ListGroup, Tab, Tabs, Spinner } from 'react-bootstrap';
import axiosInstance from '../setting/axiosInstance';

const ReportsPage = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [spendingReport, setSpendingReport] = useState(null);
    const [incomeReport, setIncomeReport] = useState(null);
    const [netIncomeReport, setNetIncomeReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('spending'); // Default active tab

    const fetchReport = async (reportType) => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const config = {
                headers: { 'x-auth-token': token },
                params: { startDate, endDate } // Pass dates as query parameters
            };
            const res = await axiosInstance.get(`/reports/${reportType}`, config);
            switch (reportType) {
                case 'spending-by-category':
                    setSpendingReport(res.data);
                    break;
                case 'income-by-category':
                    setIncomeReport(res.data);
                    break;
                case 'net-income':
                    setNetIncomeReport(res.data);
                    break;
                default:
                    break;
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to fetch report.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReports = () => {
        if (!startDate || !endDate) {
            setError('Please select both start and end dates.');
            return;
        }
        if (new Date(startDate) > new Date(endDate)) {
            setError('Start date cannot be after end date.');
            return;
        }
        setError(''); // Clear previous errors
        fetchReport('spending-by-category');
        fetchReport('income-by-category');
        fetchReport('net-income');
    };

    const renderSpendingReport = () => {
        if (!spendingReport) return <Alert variant="info" className="mt-3 text-center">Select dates and click "Generate Reports" to view spending by category.</Alert>;
        if (spendingReport.length === 0) return <Alert variant="warning" className="mt-3 text-center">No expenses found for the selected period.</Alert>;

        const totalSpent = spendingReport.reduce((acc, item) => acc + item.totalSpent, 0);

        return (
            <div className="mt-3">
                <h5 className="mb-3 text-center">Total Spent: ${totalSpent.toFixed(2)}</h5>
                <ListGroup>
                    {spendingReport.map(item => (
                        <ListGroup.Item key={item._id} className="d-flex justify-content-between align-items-center">
                            {item._id}
                            <span className="badge bg-danger">${item.totalSpent.toFixed(2)}</span>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        );
    };

    const renderIncomeReport = () => {
        if (!incomeReport) return <Alert variant="info" className="mt-3 text-center">Select dates and click "Generate Reports" to view income by category.</Alert>;
        if (incomeReport.length === 0) return <Alert variant="warning" className="mt-3 text-center">No income found for the selected period.</Alert>;

        const totalReceived = incomeReport.reduce((acc, item) => acc + item.totalReceived, 0);

        return (
            <div className="mt-3">
                <h5 className="mb-3 text-center">Total Received: ${totalReceived.toFixed(2)}</h5>
                <ListGroup>
                    {incomeReport.map(item => (
                        <ListGroup.Item key={item._id} className="d-flex justify-content-between align-items-center">
                            {item._id}
                            <span className="badge bg-success">${item.totalReceived.toFixed(2)}</span>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </div>
        );
    };

    const renderNetIncomeReport = () => {
        if (!netIncomeReport) return <Alert variant="info" className="mt-3 text-center">Select dates and click "Generate Reports" to view net income.</Alert>;

        const { totalIncome: netTotalIncome, totalExpenses: netTotalExpenses, netIncome: calculatedNetIncome } = netIncomeReport;

        return (
            <div className="mt-3 text-center">
                <p><strong>Total Income:</strong> <span className="text-success">${netTotalIncome.toFixed(2)}</span></p>
                <p><strong>Total Expenses:</strong> <span className="text-danger">${netTotalExpenses.toFixed(2)}</span></p>
                <Alert variant={calculatedNetIncome >= 0 ? 'success' : 'danger'} className="mt-3">
                    <h4>Net Income/Loss: ${calculatedNetIncome.toFixed(2)}</h4>
                </Alert>
            </div>
        );
    };

    return (
        <Container className="mt-5">
            <h1 className="text-center mb-4">Financial Reports</h1>

            <Card className="mb-4">
                <Card.Body>
                    <Card.Title className="mb-3">Select Report Period</Card.Title>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Row className="align-items-end">
                        <Col md={5}>
                            <Form.Group controlId="startDate">
                                <Form.Label>Start Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={5}>
                            <Form.Group controlId="endDate">
                                <Form.Label>End Date</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={2}>
                            <Button
                                variant="primary"
                                onClick={handleGenerateReports}
                                className="w-100"
                                disabled={loading}
                            >
                                {loading ? <Spinner animation="border" size="sm" /> : 'Generate Reports'}
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card>
                <Card.Body>
                    <Tabs
                        id="report-tabs"
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k)}
                        className="mb-3"
                        fill // Makes tabs take full width
                    >
                        <Tab eventKey="spending" title="Spending by Category">
                            {renderSpendingReport()}
                        </Tab>
                        <Tab eventKey="income" title="Income by Category">
                            {renderIncomeReport()}
                        </Tab>
                        <Tab eventKey="net-income" title="Net Income/Loss">
                            {renderNetIncomeReport()}
                        </Tab>
                    </Tabs>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ReportsPage;