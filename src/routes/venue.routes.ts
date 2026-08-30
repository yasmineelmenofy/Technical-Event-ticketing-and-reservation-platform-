import { Router } from "express";
import {
  fetchAllVenuesController,
  fetchVenueByIdController,
  createVenueController,
  modifyVenueController,
  modifyVenueStatusController,
} from "../controllers/venue.controller.js";


const router = Router();


router.get('/', fetchAllVenuesController);
router.get('/:id', fetchVenueByIdController);
router.post('/', createVenueController);
router.put('/:id', modifyVenueController);
router.patch('/:id/status', modifyVenueStatusController);


export default router;