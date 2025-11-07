import express from 'express';
// import Admin from '../models/Admin';
import  {updateBoxDetails,updateCourtAvailability,updateOperatingHours,DeleteBox} from '../Controller/AdminCotroller.js';
import { auth,isAdmin,isUser } from '../middleware/auth.js';
const AdminRouter = express.Router();

AdminRouter.put("/update-box-details/:boxId",auth, updateBoxDetails);
AdminRouter.put("/update-court-availability/:boxId",auth, updateCourtAvailability);
AdminRouter.put("/update-operating-hours/:boxId",auth,updateOperatingHours)
AdminRouter.delete("/delete-box/:boxId",auth,DeleteBox);

export default AdminRouter;
