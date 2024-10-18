const { validationResult } = require("express-validator");
const mongoSanitize = require("mongo-sanitize");

const validateRequest = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((error: any) => ({
        field: error.param,
        message: error.msg,
      })),
    });
  }
  next();
};

module.exports = validateRequest;
