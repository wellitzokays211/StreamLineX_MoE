import 'bootstrap/dist/css/bootstrap.min.css';

import { Alert, Badge, Button, Card, Col, Container, Form, InputGroup, ListGroup, ProgressBar, Row, Table } from 'react-bootstrap';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import React, { useEffect, useState } from 'react';

import axios from 'axios';

const Dashboard = () => {
  const [budget, setBudget] = useState('');
  const [budgets, setBudgets] = useState([]);
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [totalAllocated, setTotalAllocated] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [finalizeSuccess, setFinalizeSuccess] = useState(false);
  const [finalizeError, setFinalizeError] = useState(null);

  // Custom color scheme
  const colors = {
    primary: '#3498db',
    secondary: '#2ecc71',
    warning: '#f39c12',
    danger: '#e74c3c',
    info: '#1abc9c',
    chartColors: ['#3498db', '#2ecc71', '#f39c12', '#e74c3c', '#9b59b6', '#1abc9c']
  };

  // Format currency as LKR with commas
  const formatCurrency = (amount) => {
    return `LKR ${Number(amount).toLocaleString('en-LK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Fetch budgets and activities
  useEffect(() => {
    fetchBudgets();
    fetchActivities();
  }, []);

  // Filter activities whenever the activities list changes
  useEffect(() => {
    let filtered = activities.filter(activity => 
      activity.budget !== null && 
      activity.priority !== null &&
      activity.status === 'Accepted'
    );
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(activity => 
        activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.zone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply priority filter
    if (filterPriority) {
      filtered = filtered.filter(activity => activity.priority === filterPriority);
    }
    
    setFilteredActivities(filtered);
  }, [activities, searchTerm, filterPriority]);

  const fetchBudgets = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/budgets/get');
      setBudgets(response.data.budgets);
      // If a budget exists, set it in the form for editing
      if (response.data.budgets.length > 0) {
        setBudget(response.data.budgets[0].budget);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/update_activity/get');
      setActivities(response.data.activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleSaveBudget = async () => {
    if (!budget || isNaN(budget)) {
      alert('Please enter a valid budget amount');
      return;
    }

    try {
      if (budgets.length > 0) {
        // Update existing budget
        await axios.put('http://localhost:4000/api/budgets/update', { 
          id: budgets[0].id, 
          budget 
        });
        alert('Budget updated successfully');
      } else {
        // Create new budget
        await axios.post('http://localhost:4000/api/budgets/add', { budget });
        alert('Budget created successfully');
      }
      fetchBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('Failed to save budget');
    }
  };

  const handleActivitySelect = (activity) => {
    const isSelected = selectedActivities.some(a => a.id === activity.id);
    if (isSelected) {
      setSelectedActivities(selectedActivities.filter(a => a.id !== activity.id));
    } else {
      setSelectedActivities([...selectedActivities, activity]);
    }
  };

  // Calculate total allocated budget whenever selected activities change
  useEffect(() => {
    const total = selectedActivities.reduce((sum, activity) => {
      return sum + parseFloat(activity.budget || 0);
    }, 0);
    setTotalAllocated(total);
  }, [selectedActivities]);

  // Calculate remaining budget
  const currentBudgetAmount = budgets.length > 0 ? parseFloat(budgets[0].budget) : 0;
  const remainingBudget = currentBudgetAmount - totalAllocated;
  const budgetUsagePercentage = currentBudgetAmount > 0 ? (totalAllocated / currentBudgetAmount) * 100 : 0;

  // Prepare chart data
  const priorityChartData = [
    { name: 'High', value: filteredActivities.filter(a => a.priority === 'High').length },
    { name: 'Medium', value: filteredActivities.filter(a => a.priority === 'Medium').length },
    { name: 'Low', value: filteredActivities.filter(a => a.priority === 'Low').length }
  ].filter(item => item.value > 0);

  // Create zone distribution data
  const zoneData = filteredActivities.reduce((acc, activity) => {
    const existingZone = acc.find(item => item.name === activity.zone);
    if (existingZone) {
      existingZone.value += parseFloat(activity.budget || 0);
    } else {
      acc.push({
        name: activity.zone,
        value: parseFloat(activity.budget || 0)
      });
    }
    return acc;
  }, []);

  // Calculate style for remaining budget
  const getBudgetStyle = () => {
    if (remainingBudget < 0) return 'danger';
    if (remainingBudget < currentBudgetAmount * 0.2) return 'warning';
    return 'success';
  };

  // Get priority badge variant
  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'High': return 'danger';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'secondary';
    }
  };

  // Finalize Budget Allocation function
  const handleFinalizeAllocation = async () => {
    if (selectedActivities.length === 0) {
      setFinalizeError('Please select at least one activity to allocate budget');
      return;
    }

    if (budgets.length === 0) {
      setFinalizeError('No budget available to allocate');
      return;
    }

    setIsFinalizing(true);
    setFinalizeError(null);
    setFinalizeSuccess(false);

    try {
      // Prepare the allocations array in the correct format
      const allocations = selectedActivities.map(activity => ({
        activityId: activity.id,
        amount: parseFloat(activity.budget),
        priority: parseInt(activity.priority) // Assuming priority is stored as a number in the activity
      }));

      // Prepare the request data
      const requestData = {
        budgetId: budgets[0].id, // Using the first budget's ID
        allocations
      };

      const response = await axios.post('http://localhost:4000/api/budgets/finalize', requestData);

      if (response.data.success) {
        setFinalizeSuccess(true);
        setSelectedActivities([]);
        fetchBudgets();
        fetchActivities();
      }
    } catch (error) {
      console.error('Error finalizing allocation:', error);
      setFinalizeError(error.response?.data?.message || 'Failed to finalize budget allocation');
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <Container fluid className="p-4 bg-light min-vh-100" style={{ marginLeft: 250, maxWidth: 1200 }}>
      <h1 className="display-5 fw-bold mb-4" style={{ color: "#0D47A1", textAlign: "left", fontSize: "2rem" }}>
        Budget Management Dashboard
      </h1>
      {/* Quick Stats Row */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-left h-100 shadow-sm" style={{ borderLeft: '5px solid #0D47A1', borderRadius: 12 }}>
            <Card.Body>
              <h6 className="text-muted" style={{ textAlign: "left", fontSize: "1rem" }}>Total Budget</h6>
              <h3 className="fw-bold" style={{ textAlign: "left", fontSize: "1.25rem", color: '#0D47A1' }}>{formatCurrency(currentBudgetAmount)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-left h-100 shadow-sm" style={{ borderLeft: '5px solid #0D47A1', borderRadius: 12 }}>
            <Card.Body>
              <h6 className="text-muted" style={{ textAlign: "left", fontSize: "1rem" }}>Allocated Budget</h6>
              <h3 className="fw-bold" style={{ textAlign: "left", fontSize: "1.25rem", color: '#0D47A1' }}>{formatCurrency(totalAllocated)}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-left h-100 shadow-sm" style={{ borderLeft: '5px solid #0D47A1', borderRadius: 12 }}>
            <Card.Body>
              <h6 className="text-muted" style={{ textAlign: "left", fontSize: "1rem" }}>Remaining Budget</h6>
              <h3 className={`fw-bold text-${getBudgetStyle()}`} style={{ textAlign: "left", fontSize: "1.25rem", color: '#0D47A1' }}>
                {formatCurrency(remainingBudget)}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-left h-100 shadow-sm" style={{ borderLeft: '5px solid #0D47A1', borderRadius: 12 }}>
            <Card.Body>
              <h6 className="text-muted" style={{ textAlign: "left", fontSize: "1rem" }}>Total Activities</h6>
              <h3 className="fw-bold" style={{ textAlign: "left", fontSize: "1.25rem", color: '#0D47A1' }}>{filteredActivities.length}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="mb-4">
        {/* Budget Management Card */}
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm" style={{ borderRadius: 12 }}>
            <Card.Header style={{ backgroundColor: "#0D47A1", color: "#fff", textAlign: "left", fontSize: "1.1rem", borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
              <h5 className="mb-0" style={{ fontSize: "1.1rem" }}>Budget Management</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <InputGroup className="mb-3">
                  <InputGroup.Text>LKR</InputGroup.Text>
                  <Form.Control
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="Enter budget amount"
                  />
                  <Button 
                    variant={budgets.length > 0 ? "warning" : "success"} 
                    onClick={handleSaveBudget}
                  >
                    {budgets.length > 0 ? "Update Budget" : "Create Budget"}
                  </Button>
                </InputGroup>
              </Form>
              {budgets.length > 0 && (
                <div className="mt-4">
                  <h6 className="fw-bold mb-3" style={{ textAlign: 'left' }}>Current Budget</h6>
                  <Table striped hover>
                    <thead className="table-light">
                      <tr>
                        <th>Amount</th>
                        <th>Created At</th>
                        <th>Last Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{formatCurrency(budgets[0].budget)}</td>
                        <td>{new Date(budgets[0].created_at).toLocaleDateString()}</td>
                        <td>{new Date(budgets[0].updated_at).toLocaleDateString()}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        {/* Charts & Analytics */}
        <Col lg={6} className="mb-4">
          <Card className="shadow-sm h-100" style={{ borderRadius: 12 }}>
            <Card.Header style={{ backgroundColor: "#0D47A1", color: "#fff", textAlign: "left", fontSize: "1.1rem", borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
              <h5 className="mb-0" style={{ fontSize: "1.1rem" }}>Budget Analytics</h5>
            </Card.Header>
            <Card.Body>
              <h6 className="fw-bold mb-3" style={{ textAlign: 'left' }}>Budget Utilization</h6>
              <ProgressBar className="mb-4" style={{ height: '25px' }}>
                <ProgressBar 
                  variant="success" 
                  now={budgetUsagePercentage} 
                  key={1} 
                  label={`${budgetUsagePercentage.toFixed(1)}%`} 
                />
              </ProgressBar>
              <Row>
                <Col md={6}>
                  <h6 className="fw-bold mb-2" style={{ textAlign: 'left' }}>Priority Distribution</h6>
                  <div style={{ height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={priorityChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="value"
                          nameKey="name"
                          label
                        >
                          {priorityChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors.chartColors[index % colors.chartColors.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} activities`, `${name} Priority`]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Col>
                <Col md={6}>
                  <h6 className="fw-bold mb-2" style={{ textAlign: 'left' }}>Zone Budget Allocation</h6>
                  <div style={{ height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={zoneData}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={80} />
                        <Tooltip formatter={(value) => [formatCurrency(value), 'Budget']} />
                        <Bar dataKey="value" fill="#0D47A1" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Priority Activities Card */}
      <Card className="shadow-sm mb-4" style={{ borderRadius: 12 }}>
        <Card.Header style={{ backgroundColor: "#0D47A1", color: "#fff", textAlign: "left" }}>
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0" style={{ textAlign: 'left' }}>Priority Activities</h5>
            </Col>
            <Col md={3}>
              <Form.Control
                type="text"
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control-sm"
              />
            </Col>
            <Col md={2}>
              <Form.Select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="form-select-sm"
              >
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {filteredActivities.length > 0 ? (
            <div className="table-responsive">
              <Table striped hover>
                <thead className="table-light">
                  <tr>
                    <th>Select</th>
                    <th>Description</th>
                    <th>Zone</th>
                    <th>Budget</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActivities.map((activity) => (
                    <tr key={activity.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedActivities.some(a => a.id === activity.id)}
                          onChange={() => handleActivitySelect(activity)}
                        />
                      </td>
                      <td>{activity.description}</td>
                      <td>
                        <Badge bg="secondary">{activity.zone}</Badge>
                      </td>
                      <td>{formatCurrency(activity.budget)}</td>
                      <td>
                        <Badge bg={getPriorityBadge(activity.priority)}>
                          {activity.priority}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg="success">{activity.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <Alert variant="info">
              No activities matching your criteria are available.
            </Alert>
          )}
        </Card.Body>
      </Card>
      {/* Allocated Budget Summary */}
      {selectedActivities.length > 0 && (
        <Card className="shadow-sm" style={{ borderRadius: 12 }}>
          <Card.Header style={{ backgroundColor: '#FFC107', color: '#212529', textAlign: 'left', borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
            <h5 className="mb-0" style={{ textAlign: 'left' }}>Allocated Budget Summary</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <h6 className="fw-bold mb-3" style={{ textAlign: 'left' }}>Selected Activities ({selectedActivities.length})</h6>
                <ListGroup className="mb-3">
                  {selectedActivities.map((activity) => (
                    <ListGroup.Item 
                      key={activity.id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <Badge bg={getPriorityBadge(activity.priority)} className="me-2">
                          {activity.priority}
                        </Badge>
                        {activity.description}
                      </div>
                      <Badge bg="primary" pill>
                        {formatCurrency(activity.budget)}
                      </Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Col>
              <Col md={6}>
                <Card className="bg-light" style={{ borderRadius: 8 }}>
                  <Card.Body>
                    <h6 className="fw-bold mb-3" style={{ textAlign: 'left' }}>Budget Allocation Summary</h6>
                    <Table borderless size="sm">
                      <tbody>
                        <tr>
                          <td>Total Budget:</td>
                          <td className="text-end fw-bold">{formatCurrency(currentBudgetAmount)}</td>
                        </tr>
                        <tr>
                          <td>Total Allocated:</td>
                          <td className="text-end fw-bold">{formatCurrency(totalAllocated)}</td>
                        </tr>
                        <tr className="border-top">
                          <td>Remaining Budget:</td>
                          <td className={`text-end fw-bold text-${getBudgetStyle()}`}>
                            {formatCurrency(remainingBudget)}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                    <ProgressBar className="mt-3">
                      <ProgressBar 
                        variant="success" 
                        now={Math.min(budgetUsagePercentage, 100)} 
                        key={1} 
                      />
                      {budgetUsagePercentage > 100 && (
                        <ProgressBar 
                          variant="danger" 
                          now={(budgetUsagePercentage - 100)} 
                          key={2} 
                        />
                      )}
                    </ProgressBar>
                    <div className="text-left mt-2">
                      <small>{budgetUsagePercentage.toFixed(1)}% of budget allocated</small>
                    </div>
                    {remainingBudget < 0 && (
                      <Alert variant="danger" className="mt-3">
                        Warning: Budget exceeded by {formatCurrency(Math.abs(remainingBudget))}
                      </Alert>
                    )}
                  </Card.Body>
                </Card>
                <div className="d-grid gap-2 mt-3">
                  <Button 
                    variant="success" 
                    size="lg"
                    onClick={handleFinalizeAllocation}
                    disabled={isFinalizing}
                  >
                    {isFinalizing ? 'Finalizing...' : 'Finalize Budget Allocation'}
                  </Button>
                </div>
                {finalizeSuccess && (
                  <Alert variant="success" className="mt-3">
                    Budget allocation finalized successfully!
                  </Alert>
                )}
                {finalizeError && (
                  <Alert variant="danger" className="mt-3">
                    {finalizeError}
                  </Alert>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default Dashboard;