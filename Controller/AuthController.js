// import User from "../models/BaseUser.js"; 
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import crypto from "crypto";
import nodemailer from "nodemailer";
import BaseUser from "../models/BaseUser.js";
import User from "../models/BaseUser.js";
import Admin from "../models/Admin.js";

dotenv.config();


export const verifyEmail=async(req,res)=>{
    const {token}=req.query;
    const user =await BaseUser.findOne({verificationToken:token});
    console.log(user);
    console.log(token);
    
    
    if(!user){
         return res.status(400).json({
                success: false,
                message: "Invalid or expired token",
            })     
    }
    user.isVerified=true;
    user.verificationToken=undefined;
    await user.save();
    res.status(200).json({
        success:true,
        message:"Email Verified sucessfully"
    })

}
export const resendVerification = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await BaseUser.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // Generate new token
    const verificationToken = crypto.randomBytes(20).toString("hex");
    const verificationTokenExpires = Date.now() + 60 * 60 * 1000; // 1 hour

    user.verificationToken = verificationToken;
    
    await user.save();

    // Send email again
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verifyLink = `${process.env.BASE_URL}/verify/${verificationToken}`;

    await transporter.sendMail({
      to: email,
      subject: "Resend: Verify Your Email",
      html: `<p>Here is your new verification link:</p>
             <a href="${verifyLink}">${verifyLink}</a>
             <p>This link will expire in 1 hour.</p>`,
    });

    res.status(200).json({
      success: true,
      message: "Verification email resent successfully.",
      verificationToken,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error resending verification email.",
      error: error.message,
    });
  }
};
export const forgetPassword=async(req,res)=>{
    const {email}=req.body;
    const userData=await BaseUser.findOne({email:email});
    if(!userData){
        return res.status(404).json({
            success:false,
            message:"User not found",
        });

    }
  const resetToken=crypto.randomBytes(20).toString("hex");
   
    userData.resetToken=resetToken;
  await userData.save();
   const transporter=nodemailer.createTransport({
    service:"Gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS,
    },
   });
   const resetLink=`${process.env.BASE_URL}/reset-password/${resetToken}`;
   await transporter.sendMail({
    to:email,
    subject:"Reset Password",
    html:`<p>Here is your reset password link:</p>
    <a href="${resetLink}">${resetLink}</a>
    <p>This link will expire in 15 minutes.</p>`,
   });
   res.status(200).json({
    success:true,
    message:"Reset password link sent successfully",
    resetToken,
   })

}
export const resetPassword=async(req,res)=>{

    const {resetToken}=req.query;
    const {newPassword}=req.body;
    const user=await BaseUser.findOne({resetToken:resetToken});
        if(!newPassword && newPassword.length<6){
              return res.status(400).json({
                success:false,
                message:"Password must be at least 6 characters long",
            });
        }
        const isame=await bcrypt.compare(newPassword,user.password);
        if(isame){
            return res.status(400).json({
                success:false,
                message:"New password must be different from the old password",
            });
        }
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Invalid or expired token",
            });
        }
        const hashedPassword=await bcrypt.hash(newPassword,10);
        user.password=hashedPassword;
        user.resetToken=undefined;
        await user.save();
       const payload = { email: user.email, id: user._id };
const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "2h" });

// optional: set cookie
res.cookie("token", token, {
  httpOnly: true,
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
});

// final response
return res.status(200).json({
  success: true,
  message: "Password reset successful — logged in automatically",
  token,
  user,
});
}
export const signup = async (req, res) => {
    try {
        // get data
        const { name, email, password,phoneNumber,role } = req.body;
        const userRole = role === 'admin' ? 'admin' : 'user';
        // check if user already exist 
        const existingUser = await BaseUser.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User Already Exists",
            })
        }

        // Secured password 
        let hashedPassword;
        try {
            hashedPassword = await bcrypt.hash(password, 10);
           
        }
        catch (err) {
            return res.status(500).json({
                success: false,
                message: "Error in hashing password",
            })
        }

         const verificationToken = crypto.randomBytes(20).toString("hex");
         const Model = userRole === 'admin' ? Admin : User;
         const verificationTokenExpires = Date.now() + 60 * 60 * 1000;
        // Create Entry for User
        let user = await Model.create({
            name,email,password:hashedPassword,
            phoneNumber,
            role,
            verificationToken
        });
          const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
      const verifyLink = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;
     try {
  await transporter.sendMail({
    to: email,
    subject: "Verify Your Email",
    html: `<h3>Welcome, ${name}!</h3>
           <p>Please click below to verify your email:</p>
           <a href="${verifyLink}">${verifyLink}</a>
           <p>This link will expire in 1 hour.</p>`,
  });
} catch (mailError) {
  console.error("Error sending email:", mailError);
  return res.status(500).json({
    success: false,
    message: "Error sending verification email. Please try again later.",
  });
}

        return res.status(200).json({
            success : true,
            message : "User Created Successfully",
            data : user
        });
    }
    catch (err) {
        console.error(err)
        return res.status(500).json({
            success: false,
            message: "User cannot be register,Please try again later",
            Error: err.message,
        })
    }
}

export const login=async (req,res)=>{
    try {
        const {email,password}=req.body
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"please fill all the details",
            });
        }
        
            const user=await BaseUser.findOne({email});
            if(!user){
                return res.status(401).json({
                    success:false,
                    message:"User is not registerd ",
                });
            } 
            if (!user.isVerified) {
             return res.status(403).json({ message: 'Please verify your email to login.' });
        } 
            const payload={
                email : user.email,
                id : user.id,
                role : user.role,
                
            }
        if(await bcrypt.compare(password,user.password)){
                  let token=jwt.sign(payload,process.env.JWT_SECRET,{
                    expiresIn:"2h"
                  })
         user.token=token
         user.password=undefined
         const options={
            expires:new Date(Date.now()+3*24*60*60*1000),
            httpOnly:true
         }
         res.cookie("token",token,options).status(200).json({
            success:true,
            token,
            user,
            message:"login successfully",
         })
        }
        else{
           return res.status(403).json({
            success:false,
         message:"password not matched ",
           })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"login failure",
        })
    }
}