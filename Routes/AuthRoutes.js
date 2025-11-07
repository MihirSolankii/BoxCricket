import express from "express";
const router = express.Router();
import {resetPassword, signup} from "../Controller/AuthController.js";
import { login } from "../Controller/AuthController.js";
import {verifyEmail} from "../Controller/AuthController.js"
import {resendVerification} from "../Controller/AuthController.js"
import {forgetPassword} from "../Controller/AuthController.js"
import BaseUser from '../models/BaseUser.js';
import { auth,isAdmin,isUser } from '../middleware/auth.js';
import UserProfile from  '../Controller/UserProfile.js'
import AdminProfile from  '../Controller/AdminProfile.js'

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify",verifyEmail);
router.post("/resend-verification",resendVerification);
router.post("/forget-password",forgetPassword);
router.post("/reset-password",resetPassword);
router.get('/profile', auth, async (req, res) => { // 1. Use auth middleware and make function async
    
    // 2. For a profile, typically use ID/email from the authenticated user token (req.user)
    const { id } = req.user; 
    console.log("2. ID being searched in DB:", id);
    
    try {
        // 3. Await the execution of the Mongoose query
        const userone = await BaseUser.findById(id).select('-password'); // Find by ID is standard for auth, and exclude the password

        if (!userone) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // 4. Respond with the actual user document (which is safe to serialize)
        return res.status(200).json({
            success: true,
            message: 'User profile fetched successfully',
            user: userone // Renamed to 'user' for clarity
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while fetching the profile'
        });
    }
});
router.post("/user", auth, isUser, UserProfile)
router.post("/admin",auth,isAdmin,AdminProfile);

export default router;