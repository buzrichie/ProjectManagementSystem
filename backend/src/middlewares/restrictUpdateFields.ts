/**
 * Middleware to restrict update fields based on user role.
 * If the user role is not in the allowed roles list, restricts the update to specific fields.
 * Additionally, removes specified keys from the request body for certain roles.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
const restrictUpdateFieldsMiddleware = (req: any, res: any, next: any) => {
  try {
    const { role } = req.user;

    if (!role) {
      return res
        .status(403)
        .json({ message: "Unauthorized. User role is missing." });
    }

    const updateData = req.body;
    const allowedRoles = ["admin", "super_admin", "ceo", "manager"];
    const allowedFields = [
      "password",
      "firstName",
      "surName",
      "dateOfBirth",
      "gender",
    ];
    const fieldsToRemove = [
      "role",
      "ceo",
      "super_admin",
      "admin",
      "privileges",
    ]; // Fields not allowed for non-admin roles

    let filteredData: any = {};

    if (allowedRoles.includes(role.toLowerCase())) {
      // If role is in the allowed roles, allow full update
      filteredData = { ...updateData };
    } else {
      // Restrict updates to allowed fields and remove disallowed fields
      for (const field in updateData) {
        if (allowedFields.includes(field)) {
          filteredData[field] = updateData[field];
        }
      }

      // Ensure sensitive fields are removed even if the role tries to modify them
      fieldsToRemove.forEach((field) => {
        delete updateData[field];
      });
    }

    req.body = filteredData; // Replace original request body with the filtered data
    next();
  } catch (error: any) {
    return res.status(403).json({ message: error.message });
  }
};

module.exports = { restrictUpdateFieldsMiddleware };
