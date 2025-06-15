import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

export const validateClub = (req: Request, res: Response, next: NextFunction): void => {
  const schema = Joi.object({
    name: Joi.string().required().min(2).max(50),
    description: Joi.string().min(10).max(500),
    type: Joi.string().required().valid('biking', 'climbing', 'hiking', 'skiing', 'surfing', 'running', 'camping'),
    location: Joi.object({
      city: Joi.string(),
      country: Joi.string()
    }),
    isPrivate: Joi.boolean().required(),
    tags: Joi.array().items(Joi.string()).max(10),
    rules: Joi.array().items(Joi.string()).max(20),
    contactEmail: Joi.string().email().required()
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const errors = error.details.map((detail: Joi.ValidationErrorItem) => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors
    });
    return;
  }
  
  next();
}; 