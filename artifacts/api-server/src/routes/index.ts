import { type IRouter, Router } from "express";
import coursesRouter from "./courses";
import dashboardRouter from "./dashboard";
import examRouter from "./exam";
import healthRouter from "./health";
import mistakesRouter from "./mistakes";
import notesRouter from "./notes";
import openaiRouter from "./openai-routes";
import profileRouter from "./profile";
import progressRouter from "./progress";
import studyPlanRouter from "./study-plan";
import tasksRouter from "./tasks";

const router: IRouter = Router();

router.use(healthRouter);
router.use(notesRouter);
router.use(coursesRouter);
router.use(progressRouter);
router.use(profileRouter);
router.use(dashboardRouter);
router.use(tasksRouter);
router.use(studyPlanRouter);
router.use(mistakesRouter);
router.use(examRouter);
router.use(openaiRouter);

export default router;
