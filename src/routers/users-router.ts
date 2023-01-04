import { Router } from "express";

import { createUserSchema } from "@/schemas";
import { validateBody } from "@/middlewares";
import { gitUsersPost, usersPost } from "@/controllers";

const usersRouter = Router();

usersRouter.post("/", validateBody(createUserSchema), usersPost);
usersRouter.post("/gitUser", gitUsersPost);

export { usersRouter };
