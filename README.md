
# 📘 StreamLineX – Annual Development Planning System

StreamLineX is a web-based system developed to automate and streamline the annual development planning process for the Department of Education, Central Province, Sri Lanka. It replaces the traditional manual method with a secure, role-based digital workflow that handles activity submission, task prioritization, budget allocation, and report generation.

---

## 🚀 Features

- 📝 Activity Submission by Responsible Persons
- 📊 Task Prioritization and Budget Allocation by Site Engineers
- 📁 Plan Generation and Approval by Development Officers and Planning Directors
- 🔐 Role-Based Access Control (RBAC)
- 📄 PDF and Excel Report Downloads
- 📈 Real-time Status Tracking and Budget Analytics
- 🌐 Web-based and cross-browser compatible

---

## 🛠️ Tech Stack

**Frontend**
- React.js
- Bootstrap, Material-UI
- Axios, React Router DOM

**Backend**
- Node.js
- Express.js
- Multer (file uploads), JWT, bcrypt.js

**Database**
- MySQL
- phpMyAdmin (local development)

**Others**
- GitHub for version control
- XAMPP (Apache + MySQL server for local testing)
- PDFKit (for report generation)

---

## 📂 Project Structure

```
StreamLineX_MoE/
│
├── main_frontend/           # React.js frontend
│   ├── public/
│   ├── src/
│   └── package.json
│
├── system_backend/          # Node.js + Express backend
│   ├── routes/
│   ├── controllers/
│   └── server.js
│
├── wale.sql                 # Database schema and seed data
└── README.md
```

---

## ⚙️ Installation (Localhost)

### 1. Clone the repository
```bash
git clone https://github.com/wellitzokays211/StreamLineX_MoE.git
```

### 2. Set up the Database
- Start **XAMPP** and open `http://localhost/phpmyadmin`
- Create a new database (e.g., `streamlinex`)
- Import `wale.sql` from the project directory

### 3. Start the Backend Server
```bash
cd system_backend
npm install
npm start
```

### 4. Start the Frontend Client
```bash
cd main_frontend
npm install
npm start
```

- Access the system at: `http://localhost:3000`

---

## 🔐 Default Roles & Access

| Role               | Description                               |
|--------------------|-------------------------------------------|
| Responsible Person | Submit activities and view progress       |
| Development Officer| Manage tasks, budget, and approvals       |
| Site Engineer      | Inspect, prioritize, and allocate budget  |
| Planning Director  | Review and approve final development plan |

Some roles may require a secret key for registration.

---

## 📋 License

This project is developed for academic purposes and is not intended for commercial distribution.

---

## 🙋‍♂️ Contributions

Pull requests are welcome for bug fixes, performance improvements, or feature suggestions. Please open an issue first to discuss your proposal.

---

## 📞 Contact

- **Author**: Hansika Sanduni Walahewa  
- **Supervisor**: Prof. Ruwan Wickramarachchi  
- **Affiliation**: Department of Industrial Management, University of Kelaniya  
- 📧 Contact: [wellitzok@gmail.com](mailto:wellitzok@gmail.com)

---

_Thank you for checking out StreamLineX. If you find this useful or inspiring, consider giving the repo a ⭐!_
