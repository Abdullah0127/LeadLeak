const validateRequest = (schema) => {
  return (req, res, next) => {
    // Validate incoming request data
    const result = schema.safeParse(req.body);

    // Stop if validation fails
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    // Replace request body with validated data
    req.body = result.data;

    next();
  };
};

export default validateRequest;
