import './FinalApprovals.css';

import React, { useEffect, useState } from 'react';

import autoTable from 'jspdf-autotable';
import axios from 'axios';
import { jsPDF } from 'jspdf';

const FinalApprovalsPanel = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterZone, setFilterZone] = useState('All');
  const [filterDistrict, setFilterDistrict] = useState('All');
  const [filterComponent, setFilterComponent] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('priority');

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

  // Get unique values for filter dropdowns
  const zones = ['All', ...new Set(allocations.map(alloc => alloc.zone))];
  const districts = ['All', ...new Set(allocations.map(alloc => alloc.district))];
  const components = ['All', ...new Set(allocations.map(alloc => alloc.component || 'N/A'))];
  const statuses = ['All', ...new Set(allocations.map(alloc => alloc.status))];

  // Filter and sort allocations
  const filteredAllocations = allocations
    .filter(alloc => {
      // Zone filter
      if (filterZone !== 'All' && alloc.zone !== filterZone) return false;
      
      // District filter
      if (filterDistrict !== 'All' && alloc.district !== filterDistrict) return false;
      
      // Component filter
      if (filterComponent !== 'All' && (alloc.component || 'N/A') !== filterComponent) return false;
      
      // Status filter
      if (filterStatus !== 'All' && alloc.status !== filterStatus) return false;
      
      // Search term filter (matches description, zone, or district)
      if (searchTerm && 
          !alloc.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !alloc.zone.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !alloc.district.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') return a.priority - b.priority;
      if (sortBy === 'amount') return b.allocated_amount - a.allocated_amount;
      if (sortBy === 'date') return new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === 'zone') return a.zone.localeCompare(b.zone);
      return 0;
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

    // Title
    doc.setFontSize(20);
    doc.setTextColor(33, 150, 243);
    doc.setFont('helvetica', 'bold');
    doc.text('Annual Budget Plan', 148, 20, { align: 'center' });

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

    // Budget Summary
    doc.setFontSize(14);
    doc.setTextColor(33, 150, 243);
    doc.setFont('helvetica', 'bold');
    doc.text('Budget Summary', 20, 40);

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
      activity.priority
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
      head: [['#', 'Description', 'Location', 'Component', 'Subcomponent', 'Amount (LKR)', 'Priority']],
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
            doc.text(priority.toString(), centerX, centerY + 1.5, { align: 'center' });
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
    doc.text('Generated by Budget Management System', 148, 200, { align: 'center' });

    // Save the PDF
    doc.save(`Annual_Budget_Plan_${today.getFullYear()}.pdf`);
  };

  if (loading) return <div className="loading">Loading budget allocations...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="budget-container">
      <h2
        className="page-title"
        style={{
          color: '#f2b100', 
          fontSize: '2', // smaller font size
          textAlign: 'left', // left align
        }}
      >
        Budget Allocation Management
      </h2>
      
      <div className="controls">
        <div className="search-control">
          <input
            type="text"
            placeholder="Search by description or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls-row">
          <div className="filter-control">
            <label>Zone:</label>
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

          <div className="filter-control">
            <label>District:</label>
            <select 
              value={filterDistrict}
              onChange={(e) => setFilterDistrict(e.target.value)}
              className="styled-select"
            >
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          <div className="filter-control">
            <label>Component:</label>
            <select
              value={filterComponent}
              onChange={(e) => setFilterComponent(e.target.value)}
              className="styled-select"
            >
              {components.map(component => (
                <option key={component} value={component}>{component}</option>
              ))}
            </select>
          </div>

          <div className="filter-control">
            <label>Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="styled-select"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          <div className="filter-control">
            <label>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="styled-select"
            >
              <option value="priority">Priority</option>
              <option value="amount">Amount (High to Low)</option>
              <option value="date">Date (Newest First)</option>
              <option value="zone">Zone (A-Z)</option>
            </select>
          </div>
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
        <div className="table-header">
          <h3>All Allocations ({filteredAllocations.length})</h3>
          {filteredAllocations.length < allocations.length && (
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setFilterZone('All');
                setFilterDistrict('All');
                setFilterComponent('All');
                setFilterStatus('All');
                setSearchTerm('');
              }}
            >
              Clear All Filters
            </button>
          )}
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
                    <span className={`status-badge ${alloc.status.toLowerCase()}`}>
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
    </div>
  );
};

export default FinalApprovalsPanel;