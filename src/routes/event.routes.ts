import {
  fetchAllEventsController,
  fetchEventByIdController,
  createEventController,
  modifyEventController,
  modifyEventStatusController,
} from "../controllers/event.controller.js";

import { Router } from "express";


const router = Router();

router.get('/', fetchAllEventsController);
router.get('/:id', fetchEventByIdController);
router.post('/', createEventController);
router.put('/:id', modifyEventController);
router.patch('/:id', modifyEventStatusController);


export default router;