import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { FiArrowRight, FiAward, FiCheckCircle, FiHardDrive, FiUser, FiFileText } from 'react-icons/fi';
import './RoleSelection.css';

const roles = [
  {
    title: 'Development Officer',
    path: '/development-officer',
    icon: <FiUser size={32} />,
    color: '#3c64c9', // blue
    description: 'Manage project development and coordination',
  },
  {
    title: 'Site Engineer',
    path: '/site-engineer',
    icon: <FiHardDrive size={32} />,
    color: '#79089c', // purple
    description: 'Oversee construction and technical implementation',
  },
  {
    title: 'Provincial Director',
    path: '/provincial-director',
    icon: <FiAward size={32} />,
    color: '#18ab30', // green
    description: 'Regional oversight and strategic direction',
  },
  {
    title: 'Responsible Person',
    path: '/Responsible_Person',
    icon: <FiCheckCircle size={32} />,
    color: '#dbc70f', // yellow
    description: 'Final approval and accountability',
  },
];

const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-flex-col min-vh-100" >
      <header className="border-bottom bg-white">
        <Container className="d-flex align-items-center justify-content-between py-3">
          <div className="d-flex align-items-center gap-2">
            <FiFileText className="text-primary me-2" size={28} />
            <span className="fs-3 fw-bold">StreamlineX</span>
          </div>
          <nav className="d-none d-md-flex gap-4">
            <a href="/" className="text-decoration-none text-secondary fw-medium">Home</a>
          </nav>
        </Container>
      </header>
      <main className="flex-grow-1">
        <section className="w-100 py-5 bg-light">
          <Container>
            <div className="text-center mb-5">
              <div className="badge bg-primary bg-opacity-10 text-primary mb-2 px-3 py-2">Select Your Role</div>
              <h2 className="fw-bold mb-3">Welcome to StreamLineX!</h2>
              <p className="text-muted mx-auto" >
                Please select your role to continue
              </p>
            </div>
            <Row className="g-4 justify-content-center">
              {roles.map((role, idx) => (
                <Col md={6} lg={3} key={idx}>
                  <Card
                    onClick={() => navigate(role.path)}
                    className="role-card text-center h-100 border-0 shadow-sm"
                    style={{ cursor: 'pointer', borderRadius: 16, background: '#fff', transition: 'box-shadow 0.2s', boxShadow: '0 2px 12px rgba(13,80,180,0.07)' }}
                  >
                    <Card.Body className="p-4 d-flex flex-column align-items-center">
                      <div className="role-icon mb-3" style={{ color: role.color }}>
                        {role.icon}
                      </div>
                      <Card.Title className="mb-2 fw-bold" style={{ color: role.color }}>{role.title}</Card.Title>
                      <Card.Text className="text-muted small mb-3">
                        {role.description}
                      </Card.Text>
                      <div className="role-cta d-flex align-items-center gap-2 mt-auto fw-medium" style={{ color: role.color }}>
                        <span>Continue</span>
                        <FiArrowRight />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
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

export default RoleSelection;