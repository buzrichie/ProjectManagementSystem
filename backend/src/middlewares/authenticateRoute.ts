import jwt from "jsonwebtoken";

/**
 * Middleware to authenticate routes by verifying JWT.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
const authenticateRoute = (req: any, res: any, next: any) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      return res
        .status(401)
        .json({ error: "Authorization token is required." });
    }
    const token = authorization.split(" ")[1];

    const decoded = jwt.verify(token, process.env.ACCESS_SECRET!);

    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Internal server error:", error);
    return res.status(500).json({ error: `Internal server error. ${error}` });
  }
};

const cookieAuth = (req: any, res: any, next: any) => {
  try {
    const cookie = req.session.authorization;

    if (!cookie) {
      return res
        .status(401)
        .json({ error: "Authorization token is required." });
    }
    const token = cookie.slice(cookie.indexOf("=") + 1);

    const decoded = jwt.verify(token, process.env.SECRET!);

    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Internal server error:", error);
    return res.status(500).json({ error: `Internal server error. ${error}` });
  }
};

/**
 * Middleware to check if the user has the required role(s).
 * @param {string|string[]} roles - The role(s) to check against.
 * @returns {Function} The middleware function.
 */
const hasRole = (roles: [string] | string) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || !req.user.role) {
      return res
        .status(403)
        .json({ error: "Unauthorized. User role is missing." });
    }
    if (!Array.isArray(roles)) {
      roles = [roles];
    }
    const lowercasedRoles = roles.map((role) => role.toLowerCase());

    const userRoleLowercased = req.user.role.toLowerCase();
    if (!lowercasedRoles.includes(userRoleLowercased)) {
      return res
        .status(403)
        .json({ error: "Unauthorized. Insufficient role privileges." });
    }

    next();
  };
};

/**
 * Middleware to check if the user is the owner based on the ID in the request params.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
const isOwner = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res
      .status(403)
      .json({ error: "Unauthorized. User is not authenticated." });
  }
  if (req.params.id !== req.user.id) {
    return res
      .status(403)
      .json({ error: "Unauthorized. User is not the owner." });
  }
  next();
};

/**
 * Middleware to check if the user is the owner based on the ID in the request params
 * or has an admin role.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * @returns {void}
 */
const isOwnerOrAdmin = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res
      .status(403)
      .json({ error: "Unauthorized. User is not authenticated." });
  }

  const isAdmin =
    req.user.role.toLowerCase() === "ceo" ||
    req.user.role.toLowerCase() === "super_admin";

  const isOwner = req.params.user_id === req.user.id;
  if (isAdmin || isOwner) {
    // User is either an admin or the owner, so they are authorized.
    next();
  } else {
    // User does not have admin role and is not the owner.
    res.status(403).json({
      error: "Unauthorized. User is not the owner or does not have admin role.",
    });
  }
};

const isAdmin = (req: any, res: any, next: any) => {
  try {
    if (!req.user) {
      return res
        .status(403)
        .json({ error: "Unauthorized. User is not authenticated." });
    }
    if (
      req.user.role.toLowerCase() === "ceo" ||
      req.user.role.toLowerCase() === "super_admin"
    ) {
      req.admin = true;
    }
    next();
  } catch (error: any) {
    console.error("Internal server error:", error);
    return res.status(500).json({ message: error.message });
  }
};
module.exports = {
  authenticateRoute,
  hasRole,
  isAdmin,
  cookieAuth,
  isOwner,
  isOwnerOrAdmin,
};
