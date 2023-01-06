import { signInGitHubPost, singInPost } from "@/controllers";
import { validateBody } from "@/middlewares";
import { signInGitHubSchema, signInSchema } from "@/schemas";
import { Router } from "express";

const authenticationRouter = Router();

authenticationRouter.post("/sign-in", validateBody(signInSchema), singInPost);
authenticationRouter.post("/sign-in-github", validateBody(signInGitHubSchema), signInGitHubPost);

export { authenticationRouter };
