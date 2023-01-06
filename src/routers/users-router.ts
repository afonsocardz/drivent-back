import { Router } from "express";

import { createUserSchema, createUserGitSchema } from "@/schemas";
import { validateBody } from "@/middlewares";
import { gitUsersPost, usersPost } from "@/controllers";

const usersRouter = Router();

usersRouter.post("/", validateBody(createUserSchema), usersPost);
usersRouter.post("/sign-up-git", validateBody(createUserGitSchema), gitUsersPost);

export { usersRouter };
