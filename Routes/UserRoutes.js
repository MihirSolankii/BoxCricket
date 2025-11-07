import express from 'express';
import {getallboxes} from '../Controller/UserController.js';
import {auth,isUser,isAdmin} from '../middleware/auth.js';
const UserRouter=express.Router();


UserRouter.get("/box",auth,getallboxes);

export default UserRouter;