import Joi from "joi";

export const signupValidationSchema = {
  body: Joi.object({
    userName: Joi.string().min(5).max(10),
    name: Joi.string().min(3).max(30).optional(),
    role: Joi.string().optional(),
    country: Joi.string().optional(),
    bio: Joi.string().max(250).optional(),
    email: Joi.string().email({ tlds: { allow: ["com", "org", "net"] } }),
    password: Joi.string().min(6).max(12),
    githubUsername: Joi.string().optional(),
    githubToken: Joi.string().optional(),
  })
    .options({ presence: "required" }) 
    .required(),
};



export const signinValidationSchema = {
  body: Joi.object({
    email: Joi.string().email({ tlds: { allow: ["com", "org", "net"] } }),
    password: Joi.string().min(6).max(12),
  })
    .options({ presence: "required" })
    .required(),
};