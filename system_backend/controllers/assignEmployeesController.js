import pool from "../config/db.js";

// Assign resources (employees and machines) to a job
const assignResources = async (req, res) => {
    const { jobId, employeeIds = [], machineIds = [] } = req.body;

    if (!jobId || (!Array.isArray(employeeIds) && !Array.isArray(machineIds))) {
        return res.status(400).json({ 
            success: false, 
            message: "Job ID and at least one resource type required" 
        });
    }

    try {
        await pool.query('START TRANSACTION');

        // Assign employees if any
        if (employeeIds.length > 0) {
            const empValues = employeeIds.flatMap(empId => [jobId, empId]);
            const empPlaceholders = employeeIds.map(() => "(?, ?)").join(", ");
            const empSql = `INSERT INTO job_employees (job_id, employee_id) VALUES ${empPlaceholders}`;
            await pool.query(empSql, empValues);
        }

        // Assign machines if any
        if (machineIds.length > 0) {
            const machineValues = machineIds.flatMap(machineId => [jobId, machineId]);
            const machinePlaceholders = machineIds.map(() => "(?, ?)").join(", ");
            const machineSql = `INSERT INTO job_machines (job_id, machine_id) VALUES ${machinePlaceholders}`;
            await pool.query(machineSql, machineValues);
        }

        await pool.query('COMMIT');
        res.json({ 
            success: true, 
            message: "Resources assigned successfully",
            assignedEmployees: employeeIds.length,
            assignedMachines: machineIds.length
        });
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error("Error assigning resources:", err);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

// Get all assigned resources for a job
const getAssignedResources = async (req, res) => {
    const { jobId } = req.params; // Changed from req.body to req.params for RESTful API

    if (!jobId) {
        return res.status(400).json({ 
            success: false, 
            message: "Job ID is required" 
        });
    }

    try {
        // Get assigned employees
        const [employees] = await pool.query(`
            SELECT e.id, e.name, e.position, 
                   COUNT(*) as assignments_count, 
                   MAX(je.assigned_at) as last_assigned_at
            FROM job_employees je
            JOIN employees e ON e.id = je.employee_id
            WHERE je.job_id = ?
            GROUP BY e.id
            ORDER BY je.assigned_at DESC`, 
            [jobId]
        );

        // Get assigned machines
        const [machines] = await pool.query(`
            SELECT m.id, m.machine_id as machineId, m.machine_name as machineName,
                   m.status, COUNT(*) as assignments_count,
                   MAX(jm.assigned_at) as last_assigned_at
            FROM job_machines jm
            JOIN machines m ON m.id = jm.machine_id
            WHERE jm.job_id = ?
            GROUP BY m.id
            ORDER BY jm.assigned_at DESC`,
            [jobId]
        );

        res.json({ 
            success: true, 
            employees: employees || [],
            machines: machines || []
        });
    } catch (err) {
        console.error("Error fetching assigned resources:", err);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};

export { assignResources, getAssignedResources };