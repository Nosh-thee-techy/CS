import { validationResult } from 'express-validator';

/**
 * Middleware that checks express-validator results.
 * If there are validation errors, responds with 400 and
 * the list of error messages. Otherwise, continues to the next handler.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return res.status(400).json({
      success: false,
      error: {
        message: messages.join(' ') || 'Missing or invalid required params',
      },
    });
  }
  next();
};

export default validate;
