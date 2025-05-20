import './PendingBudgetList.dashboard.css';

import React, { useEffect, useState } from 'react';

import autoTable from 'jspdf-autotable';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button as MuiButton } from '@mui/material';

const PendingBudgetList = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterZone, setFilterZone] = useState('All');
  const [sortBy, setSortBy] = useState('priority');
  const [openPrintDialog, setOpenPrintDialog] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
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

  // Get unique zones for filter dropdown
  const zones = ['All', ...new Set(allocations.map(alloc => alloc.zone))];

  // Filter and sort allocations
  const filteredAllocations = allocations
    .filter(alloc => filterZone === 'All' || alloc.zone === filterZone)
    .sort((a, b) => {
      if (sortBy === 'priority') return a.priority - b.priority;
      if (sortBy === 'amount') return b.allocated_amount - a.allocated_amount;
      return new Date(b.created_at) - new Date(a.created_at);
    });

  // Get PDApproved activities
  const pdApprovedActivities = allocations.filter(alloc => alloc.status === 'PDApproved');

  // Calculate totals
  const totalBudget = allocations.length > 0 ? parseFloat(allocations[0].total_budget) : 0;
  const totalAllocated = allocations.reduce((sum, alloc) => sum + parseFloat(alloc.allocated_amount), 0);
  const totalPDApproved = pdApprovedActivities.reduce((sum, alloc) => sum + parseFloat(alloc.allocated_amount), 0);

  // Priority color mapping
  const priorityColors = {
    1: '#FF5252', // Red for high priority
    2: '#FFAB40', // Orange for medium priority
    3: '#69F0AE', // Green for low priority
    4: '#B388FF'  // Purple for very low priority
  };

  const generatePDF = () => {
    if (pdApprovedActivities.length === 0) {
      alert('No PD Approved activities to generate report');
      return;
    }

    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Title of the PDF
    doc.setFontSize(20);
    doc.setTextColor(33, 150, 243);
    doc.setFont('helvetica', 'bold');
    doc.text('Annual Development Plan', 148, 20, { align: 'center' });

    // Date
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

    // Budget Overview of the PDF
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.setFont('helvetica', 'bold');
    doc.text('Budget Overview', 20, 40);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0);
    
    // Summary boxes
    doc.setFillColor(225, 245, 254);
    doc.rect(20, 45, 50, 15, 'F');
    doc.rect(80, 45, 50, 15, 'F');
    doc.rect(140, 45, 50, 15, 'F');
    
    doc.setTextColor(33, 150, 243);
    doc.setFont('helvetica', 'bold');
    doc.text('Total Budget', 25, 52);
    doc.text('Total Allocated', 85, 52);
    doc.text('PD Approved', 145, 52);
    
    doc.setTextColor(0);
    doc.text(`LKR ${totalBudget.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 25, 58);
    doc.text(`LKR ${totalAllocated.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 85, 58);
    doc.text(`LKR ${totalPDApproved.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 145, 58);

    // Approved Activities Table
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.setFont('helvetica', 'bold');
    doc.text('PD Approved Activities', 20, 75);

    // Prepare table data
    const tableData = pdApprovedActivities.map((activity, index) => [
      index + 1,
      activity.description,
      `${activity.zone}, ${activity.district}`,
      activity.component || 'N/A',
      activity.subcomponent || 'N/A',
      `LKR ${parseFloat(activity.allocated_amount).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
    
    ]);

    // Add total row
    tableData.push([
      '',
      'TOTAL',
      '',
      '',
      '',
      `LKR ${totalPDApproved.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
      ''
    ]);

    // Generate table
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
      didDrawCell: (data) => {
        if (data.column.index === 6 && data.cell.section === 'body' && data.cell.raw) {
          const priority = data.cell.raw;
          if (priority >= 1 && priority <= 4) {
            const centerX = data.cell.x + data.cell.width / 2;
            const centerY = data.cell.y + data.cell.height / 2;
            const radius = 5;
            
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

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'italic');
    doc.text('Generated by StreamLineX', 148, 200, { align: 'center' });

    // Save the PDF
    doc.save(`Annual_Development_Plan_${today.getFullYear()}.pdf`);
  };

  const generateExcel = () => {
    if (pdApprovedActivities.length === 0) {
      alert('No PD Approved activities to generate report');
      return;
    }
    const header = [
      'No', 'Description', 'Zone', 'District', 'Component', 'Subcomponent', 'Amount (LKR)', 'Priority'
    ];
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
    let csvContent = '';
    csvContent += header.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });
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

  if (loading) return <div className="loading">Loading budget allocations...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="budget-container">
      <h2 className="page-title">Budget Allocation</h2>
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
            <option value="priority">Priority</option>
            <option value="amount">Amount (High to Low)</option>
            <option value="date">Date (Newest First)</option>
          </select>
        </div>
      </div>
      <div className="summary-cards">
        <div className="summary-card blue-card">
          <h3>Total Budget</h3>
          <p>LKR {totalBudget.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        </div>
        <div className="summary-card green-card">
          <h3>Total Allocated</h3>
          <p>LKR {totalAllocated.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        </div>
        <div className="summary-card purple-card">
          <h3>PD Approved</h3>
          <p>LKR {totalPDApproved.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
        </div>
      </div>
      <div className="allocations-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h3 style={{ margin: 0 }}>All Allocations</h3>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
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
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Option Dialog */}
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