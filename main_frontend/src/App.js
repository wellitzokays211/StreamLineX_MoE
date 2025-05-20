import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';

// Responsible Person Components
import ActivityList from './components/Responsible_Person/ActivityList';
// Development Officer Components
import ActivityManagement from './components/Development_Officer/ActivityManagement';
import AddActivity from './components/Responsible_Person/AddActivity';
import AddActivity2 from './components/Development_Officer/AddActivity2';
import BudgetApprovalPage from './components/Provincial_Director/BudgetApprovalPage';
import Dashboard from './components/Development_Officer/Dashboard';
import DevOfficerAuth from './components/Development_Officer/DevOfficerAuth';
// Site Engineer Components
import EActivityManagement from './components/Site_Engineer/E-ActivityManagement';
import FinalApprovalsPanel from './components/Provincial_Director/FinalApprovalsPanel';
import MyActivity from './components/Site_Engineer/My-Activity';
import PendingBudgetList from './components/Development_Officer/PendingBudgetList';
import React from 'react';
import Responsible_Person_Auth from './components/Responsible_Person/Responsible_Person_Auth';
// Import components
import RoleSelection from './RoleSelection';
import Sidebar from './components/Responsible_Person/ResPersonSidebar';
import Sidebar2 from './components/Development_Officer/DevOfficerSidebar';
import Sidebar3 from './components/Site_Engineer/SiteEngSidebar';
import Sidebar4 from './components/Provincial_Director/ProvDirectorSidebar';
import SiteAuth from './components/Provincial_Director/ProvincialDirectorLogin';
import SiteEngineerLogin from './components/Site_Engineer/SiteEngineerLogin';
import LandingPage from './LandingPage';

const App = () => {
  const location = useLocation();
  
  // Define which sidebar to show for each route
  const getSidebar = () => {
    const responsiblePersonRoutes = ['/add-activity', '/list-activity'];
    const devOfficerRoutes = ['/Add', '/Activity', '/priority-list', '/budget-list'];
    const siteEngineerRoutes = ['/list-e', '/e-activity'];
    const provincialDirectorRoutes = ['/list-all', '/final'];
    
    if (responsiblePersonRoutes.some(route => location.pathname.includes(route))) {
      return <Sidebar />;
    } else if (devOfficerRoutes.some(route => location.pathname.includes(route))) {
      return <Sidebar2 />;
    } else if (siteEngineerRoutes.some(route => location.pathname.includes(route))) {
      return <Sidebar3 />;
    } else if (provincialDirectorRoutes.some(route => location.pathname.includes(route))) {
      return <Sidebar4 />;
    }
    return null;
  };

  // Calculate main content width based on sidebar presence
  const mainContentClass ='col-md-12';

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Render the appropriate sidebar */}
        {getSidebar()}

        <div className={`main-content ${mainContentClass}`}>
          <Routes>
            {/* Common Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/role-selection" element={<RoleSelection />} />
            <Route path="/Responsible_Person" element={<Responsible_Person_Auth />} />
            <Route path="/development-officer" element={<DevOfficerAuth />} />
            <Route path="/site-engineer" element={<SiteEngineerLogin />} />
            <Route path="/provincial-director" element={<SiteAuth/>} />
            <Route path="/provincial-director-dash" element={<h2>Provincial Director Dashboard</h2>} />

            {/* Responsible Person Routes */}
            <Route path="/add-activity" element={<AddActivity />} />
            <Route path="/List-Activity" element={<ActivityList />} />

            {/* Development Officer Routes */}
            <Route path="/Add" element={<AddActivity2 />} />
            <Route path="/Activity" element={<ActivityManagement />} />
            <Route path="/priority-list" element={<Dashboard />} />
            <Route path="/budget-list" element={<PendingBudgetList />} />

            {/* Site Engineer Routes */}
            <Route path="/list-e" element={<EActivityManagement />} />
            <Route path="/e-activity" element={<MyActivity />} />


            <Route path="/list-all" element={<BudgetApprovalPage />} />
            <Route path="/final" element={<FinalApprovalsPanel />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const AppWrapper = () => {
  return (
    <Router>
      <App />
    </Router>
  );
};

export default AppWrapper;