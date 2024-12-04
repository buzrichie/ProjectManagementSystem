import { AuditLog } from "../models/AuditModel"; // Ensure the path to the Audit model is correct

// Create a new audit log entry
export const createAudit = async (req: any, res: any) => {
  try {
    const { action, user, entity, entityType, timestamp } = req.body;

    const audit = new AuditLog({
      action,
      user,
      entity,
      entityType,
      timestamp: timestamp || new Date(),
    });

    const newAudit = await audit.save();
    return res.status(201).json(newAudit);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error creating audit log", message: error.message });
  }
};

// Get all audit logs
export const getAudits = async (req: any, res: any) => {
  try {
    const audits = await AuditLog.find().populate("user entity");
    return res.status(200).json(audits);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error fetching audit logs", message: error.message });
  }
};

// Get a single audit log by ID
export const getAuditById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const audit = await AuditLog.findById(id).populate("user entity");
    if (!audit) {
      return res.status(404).json({ message: "Audit log not found" });
    }
    return res.status(200).json(audit);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error fetching audit log", message: error.message });
  }
};

// Update an audit log entry
export const updateAudit = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updatedAudit = await AuditLog.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("user entity");
    if (!updatedAudit) {
      return res.status(404).json({ message: "Audit log not found" });
    }
    return res.status(200).json(updatedAudit);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error updating audit log", message: error.message });
  }
};

// Delete an audit log entry
export const deleteAudit = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const deletedAudit = await AuditLog.findByIdAndDelete(id);
    if (!deletedAudit) {
      return res.status(404).json({ message: "Audit log not found" });
    }
    return res.status(200).json({ message: "Audit log deleted successfully" });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: "Error deleting audit log", message: error.message });
  }
};
