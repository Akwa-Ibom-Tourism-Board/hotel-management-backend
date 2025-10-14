import express from 'express';
import { adminController } from '../../controllers';

const router = express.Router();


router.get('/dyte-meetings', adminController.allDyteMeetings)




export default router;