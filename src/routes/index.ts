import { Router } from "express";
import authRouter from "../auth/auth.routes";
import establishmentsRouter from "../establishments/establishments.routes";
import analyticsRouter from "../analytics/analytics.routes";
import adminRouter from "../admin/admin.routes";

const rootRouter = Router();

rootRouter.use("/auth", authRouter);
rootRouter.use("/establishments", establishmentsRouter);
rootRouter.use("/analytics", analyticsRouter);
rootRouter.use("/admin", adminRouter);

export default rootRouter;
