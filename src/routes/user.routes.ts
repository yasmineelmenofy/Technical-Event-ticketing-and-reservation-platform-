import { Router } from "express";
import {
  fetchAllUsersController,
  fetchUserByIdController,
  registerUserController,
  loginUserController,
  updateUserController,
  deleteUserController,
} from "../controllers/user.controller.js";


const router = Router();


router.get('/', fetchAllUsersController);
router.get('/:id', fetchUserByIdController);
router.post('/register', registerUserController);
router.post('/login', loginUserController);
router.patch('/:id', updateUserController);
router.delete('/:id', deleteUserController);


export default router;
