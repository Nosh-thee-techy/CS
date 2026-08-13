import { validationResult } from 'express-validator';

/**
 * Middleware that checks express-validator results.
 * If there are validation errors, responds with 400 and
 * the list of error messages. Otherwise, continues to the next handler.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((e) => ({
        field: e.path,
        message: e.msg,
      })),
    });
  }
  next();
};

export default validate;
