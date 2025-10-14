import { Router } from 'express';
import userRouter from './userRoutes/userRoutes';
import adminRouter from './adminRoutes/adminRoutes';
import establishmentRouter from './establishmentRoutes/establishmentRoutes';

const rootRouter = Router();

rootRouter.use('/users', userRouter);
rootRouter.use('/admin', adminRouter);
rootRouter.use('/establishments', establishmentRouter);


export default rootRouter;
