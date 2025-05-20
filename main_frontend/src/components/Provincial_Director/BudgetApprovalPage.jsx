import { Alert, Badge, Button, Card, Form, Tab, Table, Tabs } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';

import axios from 'axios';

const BudgetApprovalPage = () => {
  const [budget, setBudget] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [selectedStatus, setSelectedStatus] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch budget data
        const budgetRes = await axios.get('http://localhost:4000/api/budgets/get');
        setBudget(budgetRes.data.budgets[0]);

        // Fetch allocations
        const allocationsRes = await axios.get('http://localhost:4000/api/budgets/get_all');
        setAllocations(allocationsRes.data.allocations);

        // Initialize statuses
        const initialStatuses = {};
        allocationsRes.data.allocations.forEach(allocation => {
          if (allocation.status === 'Not Started') {
            initialStatuses[allocation.activity_id] = allocation.status;
          }
        });
        
        setSelectedStatus(initialStatuses);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusChange = (activityId, status) => {
    setSelectedStatus(prev => ({
      ...prev,
      [activityId]: status
    }));
  };

  const handleRejectionReasonChange = (activityId, reason) => {
    setRejectionReasons(prev => ({
      ...prev,
      [activityId]: reason
    }));
  };

  const handleSubmit = async () => {
    setSubmitLoading(true);
    try {
      // Process each allocation
      for (const allocation of allocations) {
        const activityId = allocation.activity_id;
        
        if (allocation.status === 'Not Started' && selectedStatus[activityId]) {
          const status = selectedStatus[activityId];
          const updateData = {
            id: activityId,
            status: status
          };

          if (status === 'PDRejected') {
            updateData.rejectionReason = rejectionReasons[activityId] || 'No reason provided';
          }

          // Update activity status
          await axios.put('http://localhost:4000/api/activity/update', updateData);

          // Save to PD approvals table
          await axios.post('http://localhost:4000/api/pd-approvals', {
            activity_id: activityId,
            approval_status: status,
            rejection_reason: status === 'PDRejected' ? rejectionReasons[activityId] : null,
            component: allocation.component || null,
            subcomponent: allocation.subcomponent || null
          });
        }
      }

      // Refresh data
      const allocationsRes = await axios.get('http://localhost:4000/api/budgets/get_all');
      setAllocations(allocationsRes.data.allocations);
      
      // Clear selections
      setSelectedStatus({});
      setRejectionReasons({});
      
      setActiveTab('history');
      setError(null);
    } catch (err) {
      console.error('Error submitting approvals:', err);
      setError('Failed to submit approvals. Please try again.');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Filter allocations
  const pendingAllocations = allocations.filter(a => a.status === 'Not Started');
  const historyAllocations = allocations.filter(a => 
    a.status === 'PDApproved' || a.status === 'PDRejected'
  );

  if (loading) return (
    <div className="d-flex justify-content-center mt-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="container py-4" style={{ marginLeft: '250px', maxWidth: '1200px' }}>
      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <h2 className="mb-0">Budget Approval System</h2>
        </Card.Header>
        <Card.Body>
          {budget && (
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4>Current Budget</h4>
                <h1 className="text-success">LKR {parseFloat(budget.budget).toLocaleString()}</h1>
              </div>
              <div className="text-end">
                <small className="text-muted">Last Updated</small>
                <div>{new Date(budget.updated_at).toLocaleString()}</div>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        <Tab eventKey="pending" title={`Pending Approvals (${pendingAllocations.length})`}>
          <div className="mt-3">
            {pendingAllocations.length > 0 ? (
              <>
                <Table striped bordered hover responsive>
                  <thead className="table-dark">
                    <tr>
                      <th>Description</th>
                      <th>Location</th>
                      <th>Amount (LKR)</th>
                      <th>Priority</th>
                      <th>Component</th>
                      <th>Subcomponent</th>
                      <th>Action</th>
                      <th>Rejection Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingAllocations.map(allocation => (
                      <tr key={allocation.id}>
                        <td>{allocation.description}</td>
                        <td>{allocation.district}, {allocation.zone}</td>
                        <td className="text-end">{parseFloat(allocation.allocated_amount).toLocaleString()}</td>
                        <td className="text-center">
                          <Badge bg={allocation.priority <= 2 ? 'danger' : 'warning'}>
                            {allocation.priority}
                          </Badge>
                        </td>
                        <td>{allocation.component || 'N/A'}</td>
                        <td>{allocation.subcomponent || 'N/A'}</td>
                        <td>
                          <Form.Select 
                            value={selectedStatus[allocation.activity_id] || 'Not Started'}
                            onChange={(e) => handleStatusChange(allocation.activity_id, e.target.value)}
                          >
                            <option value="Not Started">Select action</option>
                            <option value="PDApproved">Approve</option>
                            <option value="PDRejected">Reject</option>
                          </Form.Select>
                        </td>
                        <td>
                          {selectedStatus[allocation.activity_id] === 'PDRejected' && (
                            <Form.Control
                              type="text"
                              placeholder="Enter rejection reason"
                              value={rejectionReasons[allocation.activity_id] || ''}
                              onChange={(e) => handleRejectionReasonChange(allocation.activity_id, e.target.value)}
                              required
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>

                <div className="d-flex justify-content-end mt-3">
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={handleSubmit}
                    disabled={submitLoading || Object.keys(selectedStatus).length === 0}
                  >
                    {submitLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : (
                      'Submit All Decisions'
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <Alert variant="success">
                No pending approvals at this time.
              </Alert>
            )}
          </div>
        </Tab>

        <Tab eventKey="history" title={`History (${historyAllocations.length})`}>
          <div className="mt-3">
            {historyAllocations.length > 0 ? (
              <Table striped bordered hover responsive>
                <thead className="table-dark">
                  <tr>
                    <th>Description</th>
                    <th>Location</th>
                    <th>Amount (LKR)</th>
                    <th>Component</th>
                    <th>Subcomponent</th>
                    <th>Status</th>
                    <th>Decision Date</th>
                  </tr>
                </thead>
                <tbody>
                  {historyAllocations.map(allocation => (
                    <tr key={allocation.id}>
                      <td>{allocation.description}</td>
                      <td>{allocation.district}, {allocation.zone}</td>
                      <td className="text-end">{parseFloat(allocation.allocated_amount).toLocaleString()}</td>
                      <td>{allocation.component || 'N/A'}</td>
                      <td>{allocation.subcomponent || 'N/A'}</td>
                      <td>
                        <Badge bg={allocation.status === 'PDApproved' ? 'success' : 'danger'}>
                          {allocation.status}
                        </Badge>
                      </td>
                      <td>{new Date(allocation.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <Alert variant="info">
                No approval history available.
              </Alert>
            )}
          </div>
        </Tab>
      </Tabs>
    </div>
  );
};

export default BudgetApprovalPage;