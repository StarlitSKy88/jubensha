import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

export const validateSchema = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: true
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errorMessage
      });
    }

    next();
  };
}; 