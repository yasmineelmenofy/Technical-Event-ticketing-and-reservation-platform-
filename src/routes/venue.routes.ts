import { Router } from "express";
import {
  fetchAllVenuesController,
  fetchVenueByIdController,
  createVenueController,
  modifyVenueController,
  modifyVenueStatusController,
} from "../controllers/venue.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.middleware.js";

const router = Router();


router.get('/', fetchAllVenuesController);
router.get('/:id', fetchVenueByIdController);
router.post('/',authenticate,authorize("admin"), createVenueController);
router.put('/:id',authenticate,authorize("admin"), modifyVenueController);
router.patch('/:id/status',authenticate,authorize("admin"), modifyVenueStatusController);


export default router;