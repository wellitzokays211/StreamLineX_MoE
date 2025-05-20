import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import { FiFileText, FiArrowRight, FiCheckCircle, FiUsers } from 'react-icons/fi';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-flex-col min-vh-100">
      <header className="border-bottom bg-white">
        <Container className="d-flex align-items-center justify-content-between py-3">
          <div className="d-flex align-items-center gap-2">
            <FiFileText className="text-primary me-2" size={28} />
            <span className="fs-3 fw-bold">StreamlineX</span>
          </div>
          <nav className="d-none d-md-flex gap-4">
            <a href="#features" className="text-decoration-none text-secondary fw-medium">Features</a>
            <a href="#about" className="text-decoration-none text-secondary fw-medium">About</a>
            <a href="#contact" className="text-decoration-none text-secondary fw-medium">Contact</a>
          </nav>
        </Container>
      </header>
      <main className="flex-grow-1">
        <section className="w-100 py-5 bg-light">
          <Container>
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <div className="badge bg-primary bg-opacity-10 text-primary mb-3 px-3 py-2">
                  Department of Education - Central Province
                </div>
                <h1 className="display-5 fw-bold mb-3">One-Click Annual Development Plans</h1>
                <p className="lead text-muted mb-4">
                  Streamline your annual development planning process with our intuitive, role-based system designed specifically for the Department of Education.
                </p>
                <Button size="lg" className="d-flex align-items-center gap-2 btn-primary" onClick={() => navigate('/role-selection')}>
                  Get Started <FiArrowRight />
                </Button>
              </div>
              <div className="col-lg-6 d-flex justify-content-center">
                <img
                  src="/streamlineX_landing.jpg"
                  alt="StreamlineX Dashboard Preview"
                  className="rounded shadow border"
                  width={400}
                  height={320}
                  style={{objectFit: 'cover'}}
                />
              </div>
            </div>
          </Container>
        </section>

        <section id="features" className="w-100 py-5">
          <Container>
            <div className="text-center mb-5">
              <div className="badge bg-primary bg-opacity-10 text-primary mb-2 px-3 py-2">Key Features</div>
              <h2 className="fw-bold mb-3">Simplify Your Planning Process</h2>
              <p className="text-muted mx-auto" style={{maxWidth: 700}}>
                Our platform offers a comprehensive suite of tools designed to streamline the annual development planning process.
              </p>
            </div>
            <div className="row g-4 justify-content-center">
              <div className="col-md-6 col-lg-4">
                <div className="d-flex align-items-start gap-3">
                  <FiCheckCircle className="text-primary flex-shrink-0" size={32} />
                  <div>
                    <h5 className="fw-bold">Role-Based Access</h5>
                    <p className="text-muted mb-0">Tailored dashboards and workflows for Responsible Persons, Development Officers, Site Engineers, and Planning Directors.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="d-flex align-items-start gap-3">
                  <FiCheckCircle className="text-primary flex-shrink-0" size={32} />
                  <div>
                    <h5 className="fw-bold">Automated Workflows</h5>
                    <p className="text-muted mb-0">Streamlined processes for activity submission, review, budgeting, and approval.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="d-flex align-items-start gap-3">
                  <FiCheckCircle className="text-primary flex-shrink-0" size={32} />
                  <div>
                    <h5 className="fw-bold">Hierarchical Forms</h5>
                    <p className="text-muted mb-0">Smart forms with auto-fill capabilities and hierarchical dropdowns for components and sub-components.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="d-flex align-items-start gap-3">
                  <FiCheckCircle className="text-primary flex-shrink-0" size={32} />
                  <div>
                    <h5 className="fw-bold">Real-time Notifications</h5>
                    <p className="text-muted mb-0">Stay informed with instant updates on activity status changes and approvals.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="d-flex align-items-start gap-3">
                  <FiCheckCircle className="text-primary flex-shrink-0" size={32} />
                  <div>
                    <h5 className="fw-bold">Priority Management</h5>
                    <p className="text-muted mb-0">Easily prioritize activities and allocate budgets based on site assessments.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="d-flex align-items-start gap-3">
                  <FiCheckCircle className="text-primary flex-shrink-0" size={32} />
                  <div>
                    <h5 className="fw-bold">Automated Reporting</h5>
                    <p className="text-muted mb-0">Generate and email final approved plans with a single click.</p>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section id="about" className="w-100 py-5 bg-light">
          <Container>
            <div className="row g-5 align-items-center">
              <div className="col-lg-6">
                <div className="badge bg-primary bg-opacity-10 text-primary mb-3 px-3 py-2">Our Mission</div>
                <h2 className="fw-bold mb-3">Empowering Educational Development</h2>
                <p className="text-muted mb-2">
                  StreamlineX is dedicated to empowering the Department of Education in the Central Province with efficient tools to plan, prioritize, and implement development activities that enhance educational infrastructure and resources.
                </p>
                <p className="text-muted">
                  Our platform brings together all stakeholders in the development process, from initial requests to final approvals, ensuring transparency, accountability, and optimal resource allocation.
                </p>
              </div>
              <div className="col-lg-6">
                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <div className="d-flex flex-column align-items-center p-3 border rounded bg-white shadow-sm">
                      <FiUsers className="text-primary mb-2" size={40} />
                      <h6 className="fw-bold">4 User Roles</h6>
                      <p className="text-muted text-center small mb-0">Tailored interfaces for each stakeholder in the process</p>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="d-flex flex-column align-items-center p-3 border rounded bg-white shadow-sm">
                      <FiFileText className="text-primary mb-2" size={40} />
                      <h6 className="fw-bold">Comprehensive Plans</h6>
                      <p className="text-muted text-center small mb-0">Generate detailed annual development plans</p>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </Container>
        </section>

        <section id="contact" className="w-100 py-5 border-top">
          <Container className="text-center">
            <div className="mb-4">
              <h2 className="fw-bold mb-2">Ready to Streamline Your Planning Process?</h2>
              <p className="text-muted mx-auto" style={{maxWidth: 600}}>
                Experience the efficiency of StreamlineX for your annual development planning needs.
              </p>
            </div>
            <div className="mx-auto" style={{maxWidth: 400}}>
              <Button className="w-100 mb-2" size="lg" onClick={() => navigate('/role-selection')}>
                Get Started
              </Button>
              
            </div>
          </Container>
        </section>
      </main>
      <footer className="border-top bg-white py-3">
        <Container className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2">
            <FiFileText className="text-primary" size={20} />
            <span className="fw-semibold">StreamlineX</span>
          </div>
          <div className="text-muted small">© {new Date().getFullYear()} Department of Education, Central Province. All rights reserved.</div>
          
        </Container>
      </footer>
    </div>
  );
};

export default LandingPage;
