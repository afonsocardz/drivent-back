import { CreateUserParams, CreateGitUserParams } from "@/services/users-service";
import Joi from "joi";

export const createUserSchema = Joi.object<CreateUserParams>({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

export const createUserGitSchema = Joi.object<CreateGitUserParams>({
  email: Joi.string().email().required(),
});
