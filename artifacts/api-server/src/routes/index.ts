import { Router, type IRouter } from "express";
import healthRouter from "./health";
import notesRouter from "./notes";
import coursesRouter from "./courses";
import progressRouter from "./progress";
import profileRouter from "./profile";
import dashboardRouter from "./dashboard";
import openaiRouter from "./openai-routes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(notesRouter);
router.use(coursesRouter);
router.use(progressRouter);
router.use(profileRouter);
router.use(dashboardRouter);
router.use(openaiRouter);

export default router;
