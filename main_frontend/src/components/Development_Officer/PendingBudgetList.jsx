// Component-specific CSS styles
import './PendingBudgetList.dashboard.css';

// React core imports
import React, { useEffect, useState } from 'react';

// PDF generation libraries
import autoTable from 'jspdf-autotable';
import { jsPDF } from 'jspdf';

// HTTP client for API requests
import axios from 'axios';

// Material-UI components for dialogs
import { Dialog, DialogTitle, DialogContent, DialogActions, Button as MuiButton } from '@mui/material';

/**
 * PendingBudgetList Component
 * 
 * This component manages the budget allocation dashboard for Development Officers.
 * Features include:
 * - Displaying all budget allocations with filtering and sorting capabilities
 * - Generating PDF and Excel reports of the Annual Development Plan
 * - Sending the development plan via email to the Ministry of Education
 * - Visual indicators for priority levels and status
 * - Summary cards showing total and allocated budgets
 */
const PendingBudgetList = () => {
  // State management for budget allocations and UI controls
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter and sorting states
  const [filterZone, setFilterZone] = useState('All');  
  const [sortBy, setSortBy] = useState('priority');
  const [sortDirection, setSortDirection] = useState('asc');
  
  // Dialog states
  const [openPrintDialog, setOpenPrintDialog] = useState(false);

  // Effect hook to fetch data when component mounts
  useEffect(() => {
    fetchAllData();
  }, []);
  
  /**
   * Handles sorting when column headers are clicked
   * Toggles between ascending and descending order for priority and amount columns
   * @param {string} column - The column name to sort by ('priority' or 'amount')
   */
  const handleSort = (column) => {
    if (column === 'priority') {
      // Toggle between priority and priority-desc
      setSortBy(sortBy === 'priority' ? 'priority-desc' : 'priority');
    } else if (column === 'amount') {
      // Toggle between amount and amount-asc
      setSortBy(sortBy === 'amount' ? 'amount-asc' : 'amount');
    }
  };

  /**
   * Returns visual sorting indicator (arrow) for table headers
   * @param {string} column - Column name to check for sorting
   * @returns {string} Arrow indicator (↑ or ↓) or empty string
   */
  const getSortIndicator = (column) => {
    if (column === 'priority' && (sortBy === 'priority' || sortBy === 'priority-desc')) {
      return sortBy === 'priority' ? ' ↑' : ' ↓';
    } else if (column === 'amount' && (sortBy === 'amount' || sortBy === 'amount-asc')) {
      return sortBy === 'amount' ? ' ↓' : ' ↑';
    }
    return '';
  };

  /**
   * Fetches all budget allocation data from the backend API
   * Sets loading states and handles errors appropriately
   */
  const fetchAllData = async () => {
    try {
      setLoading(true);
      // Fetch all budget allocations from the backend
      const allocationsRes = await axios.get('http://localhost:4000/api/budgets/get_all');

      if (allocationsRes.data.success) {
        setAllocations(allocationsRes.data.allocations);
      } else {
        setError('Failed to fetch allocations');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique zones from allocations for filter dropdown
  const zones = ['All', ...new Set(allocations.map(alloc => alloc.zone))];
  
  /**
   * Filters and sorts allocations based on current filter and sort settings
   * Only shows PDApproved activities in the main table
   */
  const filteredAllocations = allocations
    .filter(alloc => (filterZone === 'All' || alloc.zone === filterZone) && alloc.status === 'PDApproved')
    .sort((a, b) => {
      // Sort by priority (ascending - lower numbers first, higher priority)
      if (sortBy === 'priority') return a.priority - b.priority;
      
      // Sort by priority (descending - higher numbers first, lower priority)
      if (sortBy === 'priority-desc') return b.priority - a.priority;
      
      // Sort by amount (descending - higher amounts first)
      if (sortBy === 'amount') return parseFloat(b.allocated_amount) - parseFloat(a.allocated_amount);
      
      // Sort by amount (ascending - lower amounts first)
      if (sortBy === 'amount-asc') return parseFloat(a.allocated_amount) - parseFloat(b.allocated_amount);
      
      // Sort by creation date (newest first)
      if (sortBy === 'date') {
        return new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at);
      }
      return 0; // Default case
    });

  // Get PDApproved activities for report generation
  const pdApprovedActivities = allocations.filter(alloc => alloc.status === 'PDApproved');

  // Calculate budget totals for summary cards
  const totalBudget = allocations.length > 0 ? parseFloat(allocations[0].total_budget) : 0;
  const totalAllocated = allocations.reduce((sum, alloc) => sum + parseFloat(alloc.allocated_amount), 0);
  const totalPDApproved = pdApprovedActivities.reduce((sum, alloc) => sum + parseFloat(alloc.allocated_amount), 0);

  // Color mapping for priority levels (1=highest priority, 4=lowest priority)
  const priorityColors = {
    1: '#FF5252', // Red for high priority
    2: '#FFAB40', // Orange for medium priority
    3: '#69F0AE', // Green for low priority
    4: '#B388FF'  // Purple for very low priority
  };

  /**
   * Generates a PDF report of the Annual Development Plan
   * Creates a professionally formatted document with budget overview and activity details
   */
  const generatePDF = () => {
    if (pdApprovedActivities.length === 0) {
      alert('No PD Approved activities to generate report');
      return;
    }

    // Initialize PDF document in landscape orientation for better table layout
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // PDF Header - Title and branding
    doc.setFontSize(20);
    doc.setTextColor(33, 150, 243);
    doc.setFont('helvetica', 'bold');
    doc.text('Annual Development Plan', 148, 20, { align: 'center' });

    // PDF Header - Generation date
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(`Generated on: ${dateString}`, 148, 28, { align: 'center' });

    // Budget Overview Section Header
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.setFont('helvetica', 'bold');
    doc.text('Budget Overview', 20, 40);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    
    // Budget summary boxes with visual styling
    doc.setFillColor(225, 245, 254);
    doc.rect(20, 45, 70, 15, 'F');
    doc.rect(110, 45, 70, 15, 'F');
    
    doc.setTextColor(33, 150, 243);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Budget', 30, 52);
    doc.text('Final Allocated Budget', 120, 52);
    
    doc.setTextColor(0);
    doc.text(`LKR ${totalBudget.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 30, 58);
    doc.text(`LKR ${totalPDApproved.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 120, 58);

    // Activities Table Section Header
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.setFont('helvetica', 'bold');
    doc.text('Annual Development Activities', 20, 75);

    // Prepare table data from approved activities
    const tableData = pdApprovedActivities.map((activity, index) => [
      index + 1,
      activity.description,
      `${activity.zone}, ${activity.district}`,
      activity.component || 'N/A',
      activity.subcomponent || 'N/A',
      `LKR ${parseFloat(activity.allocated_amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
    
    ]);

    // Add total row to table data
    tableData.push([
      '',
      'TOTAL',
      '',
      '',
      '',
      `LKR ${totalPDApproved.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      ''
    ]);

    // Generate auto-table with custom styling
    autoTable(doc, {
      startY: 80,
      head: [['#', 'Description', 'Location', 'Component', 'Subcomponent', 'Amount (LKR)']],
      body: tableData,
      headStyles: {
        fillColor: [33, 150, 243],
        textColor: 255,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 30 },
        5: { cellWidth: 30, halign: 'right' },
        6: { cellWidth: 20, halign: 'center' }
      },
      // Custom cell drawing for priority indicators
      didDrawCell: (data) => {
        if (data.column.index === 6 && data.cell.section === 'body' && data.cell.raw) {
          const priority = data.cell.raw;
          if (priority >= 1 && priority <= 4) {
            const centerX = data.cell.x + data.cell.width / 2;
            const centerY = data.cell.y + data.cell.height / 2;
            const radius = 5;
            
            // Draw colored priority circle
            doc.setFillColor(priorityColors[priority]);
            doc.circle(centerX, centerY, radius, 'F');
            
            doc.setTextColor(255);
            doc.setFontSize(8);
          }
        }
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
        overflow: 'linebreak'
      },
      bodyStyles: {
        addPageContent: (data) => {
          // Custom styling for footer rows
          if (data.table.footer) {
            doc.setFillColor(225, 245, 254);
            doc.rect(
              data.table.footer.x,
              data.table.footer.y,
              data.table.width,
              data.table.footer.height,
              'F'
            );
            doc.setTextColor(33, 150, 243);
            doc.setFont('helvetica', 'bold');
          }
        }
      }
    });

    // PDF Footer with branding
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'italic');
    doc.text('Generated by StreamLineX', 148, 200, { align: 'center' });

    // Save the PDF with dynamic filename
    doc.save(`Annual_Development_Plan_${today.getFullYear()}.pdf`);
  };

  /**
   * Generates an Excel/CSV report of the Annual Development Plan
   * Creates a downloadable CSV file with all activity details
   */
  const generateExcel = () => {
    if (pdApprovedActivities.length === 0) {
      alert('No PD Approved activities to generate report');
      return;
    }
    
    // Define CSV headers
    const header = [
      'No', 'Description', 'Zone', 'District', 'Component', 'Subcomponent', 'Amount (LKR)', 'Priority'
    ];
    
    // Map activity data to CSV rows
    const rows = pdApprovedActivities.map((activity, index) => [
      index + 1,
      activity.description,
      activity.zone,
      activity.district,
      activity.component || 'N/A',
      activity.subcomponent || 'N/A',
      parseFloat(activity.allocated_amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
      activity.priority
    ]);
    
    // Add total row for Excel/CSV
    rows.push([
      '',
      'Final Allocated Budget (Total):',
      '',
      '',
      '',
      '',
      totalPDApproved.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
      ''
    ]);
    
    // Create CSV content
    let csvContent = '';
    csvContent += header.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Annual_Development_Plan_${new Date().getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Dialog control functions for print/download options
  const handlePrintClick = () => {
    setOpenPrintDialog(true);
  };
  
  const handleClosePrintDialog = () => {
    setOpenPrintDialog(false);
  };
  
  const handlePrintPDF = () => {
    setOpenPrintDialog(false);
    generatePDF();
  };
  
  const handlePrintExcel = () => {
    setOpenPrintDialog(false);
    generateExcel();
  };
  
  /**
   * Sends the Annual Development Plan via email to the Ministry of Education
   * Prepares email data and calls the backend email API
   */
  const sendToMoE = async () => {
    if (pdApprovedActivities.length === 0) {
      alert('No PD Approved activities to send');
      return;
    }
    
    try {
      // Prepare email data with plan details
      const emailData = {
        to: 'walahewa.sanduni@gmail.com',
        subject: `Annual Development Plan - ${new Date().getFullYear()}`,
        text: `Please find attached the Annual Development Plan for ${new Date().getFullYear()}`,
        planData: {
          totalBudget,
          totalPDApproved,
          activities: pdApprovedActivities.map((activity, index) => ({
            no: index + 1,
            description: activity.description,
            zone: activity.zone,
            district: activity.district,
            component: activity.component || 'N/A',
            subcomponent: activity.subcomponent || 'N/A',
            amount: parseFloat(activity.allocated_amount),
            priority: activity.priority
          }))
        }
      };
      
      // Send email via backend API
      const response = await axios.post('http://localhost:4000/api/budgets/send-plan-email', emailData);
      
      if (response.data.success) {
        alert('Annual Development Plan successfully sent to the Ministry of Education');
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send the plan. Please try again later.');
    }
  };

  // Loading and error states
  if (loading) return <div className="loading">Loading budget allocations...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="budget-container">
      {/* Page header */}
      <h2 className="page-title">Budget Allocation</h2>
      
      {/* Filter and sort controls */}
      <div className="controls">
        <div className="filter-control">
          <label>Filter by Zone:</label>
          <select 
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="styled-select"
          >
            {zones.map(zone => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>
        </div>
        
        <div className="sort-control">
          <label>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="styled-select"
          >
            <option value="priority">Priority (Low to High)</option>
            <option value="priority-desc">Priority (High to Low)</option>
            <option value="amount">Amount (High to Low)</option>
            <option value="amount-asc">Amount (Low to High)</option>
          </select>
        </div>
      </div>
      
      {/* Budget summary cards */}
      <div className="summary-cards">
        <div className="summary-card blue-card">
          <h3>Total Budget</h3>
          <p>LKR {totalBudget.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        </div>
        <div className="summary-card purple-card">
          <h3>Final Allocated Budget</h3>
          <p>LKR {totalPDApproved.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        </div>
      </div>

      {/* Main allocations table section */}
      <div className="allocations-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>Annual Development Plan</h3>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            {/* Download button */}
            <button 
              className="download-btn pdf-btn small-btn"
              onClick={handlePrintClick}
              disabled={pdApprovedActivities.length === 0}
              style={{ fontSize: '0.95rem', padding: '6px 14px' }}
            >
              <i className="fas fa-file-pdf"></i> Download Annual Development Plan
            </button>
          </div>
        </div>
        
        {/* Activities data table */}
        <div className="table-container">
          <table className="allocations-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Location</th>
                <th>Amount (LKR)</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Component</th>
                <th>Subcomponent</th>
              </tr>
            </thead>
            <tbody>
              {/* Activity rows */}
              {filteredAllocations.map((alloc, index) => (
                <tr key={alloc.id} className={alloc.status.toLowerCase()}>
                  <td>{index + 1}</td>
                  <td>{alloc.description}</td>
                  <td>{alloc.zone}, {alloc.district}</td>
                  <td>LKR {parseFloat(alloc.allocated_amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td>
                    <span 
                      className="priority-badge" 
                      style={{ backgroundColor: priorityColors[alloc.priority] || '#B388FF' }}
                    >
                      {alloc.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${alloc.status.toLowerCase()}`}
                      style={alloc.status === 'PDRejected' ? { backgroundColor: '#ff4d4f', color: '#fff' } : {}}>
                      {alloc.status}
                    </span>
                  </td>
                  <td>{alloc.component || 'N/A'}</td>
                  <td>{alloc.subcomponent || 'N/A'}</td>
                </tr>
              ))}
              
              {/* Summary total row */}
              {filteredAllocations.length > 0 && (
                <tr className="total-row" style={{ fontWeight: 'bold', backgroundColor: '#f0f8ff' }}>
                  <td colSpan={3} style={{ textAlign: 'left' }}>Final Allocated Budget</td>
                  <td>LKR {totalPDApproved.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td colSpan={4}></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print/Download Format Selection Dialog */}
      <Dialog open={openPrintDialog} onClose={handleClosePrintDialog}>
        <DialogTitle>Select Download Format</DialogTitle>
        <DialogContent>
          <MuiButton onClick={handlePrintPDF} variant="contained" color="primary" sx={{ m: 1 }} fullWidth>
            PDF
          </MuiButton>
          <MuiButton onClick={handlePrintExcel} variant="contained" color="success" sx={{ m: 1 }} fullWidth>
            Excel
          </MuiButton>
        </DialogContent>
        <DialogActions>
          <MuiButton onClick={handleClosePrintDialog} color="inherit">Cancel</MuiButton>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default PendingBudgetList;