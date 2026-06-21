import User from '../models/userModel.js';
import { getHashedPassword, handleComparePassword } from '../utils/helper.js';
import jwt from "jsonwebtoken"
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/tokens.js';

export const SignUp = async (req, res) => {
    try{
        let { name , email , password} = req.body;

        if(!name || !email || !password){
            return res.status(400).json({
                message : "All fields are required."
            })
        }
        email = email.toLowerCase();
        name = name.trim();

        const existingUser = await User.findOne({email : email});
        if(existingUser){
            return res.status(400).json({
                success : false,
                message : "User Already Registered. Please Login"
            })
        }

        const hashedPassword = await getHashedPassword(password);
        const newUser = await User.create({name,email,password : hashedPassword});

        return res.status(201).json({
            success : true,
            message : "User Registered Succesfully. Please Login",
            user : {
                name : newUser.name,
                email : newUser.email,
            }
        })
    }
    catch (error){
        console.log(`Error in registerUser : ${error.message}`)
        return res.status(400).json({
            success : false,
            message : "User registration Failed."
        })
    }
}

export const SignIn = async (req, res) => {
    try{
        let {email , password} = req.body;

        if(!email || !password){
            return res.status(400).json({
                message : "All fields are required."
            })
        }
        email = email.toLowerCase();

        const existingUser = await User.findOne({email : email});

        if(!existingUser){
            return res.status(400).json({
                success : false,
                message : "User is not Registered. Please Register"
            })
        }

        const isMatched = await handleComparePassword(password,existingUser.password);
        if(!isMatched){
            return res.status(400).json({
                success : false,
                message: "Invalid email or password"
            })
        }

        const payload = {
            userId: existingUser._id,
            email: existingUser.email
        };
        const accessToken = generateAccessToken(payload); 
        const refreshToken = generateRefreshToken(payload); 
        
        existingUser.refreshToken = refreshToken;
        // save to database
        await existingUser.save();
        
        return res.status(200).json({ success : true,                 
            data: {
                    userId: existingUser._id,
                    email: existingUser.email,
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                }, });
    }
    catch (error){
        console.log(`Error in signin : ${error.message}`)
        return res.status(400).json({
            success : false,
            message : "User sign in Failed."
        })
    }
}

export const handleRefreshToken = async (req, res) => {
    try{
        const { refreshToken } = req.body;

        if(!refreshToken) {
            return res.status(400).json({
                success : false,
                message : "refreshToken not found"
            })
        }

        const decoded = verifyRefreshToken(refreshToken);
        if(!decoded){
            return res.status(400).json({
                success : false,
                message : "Invalid refreshToken"
            })
        }

        const user = await User.findById(decoded.userId);
        if(!user){
            return res.status(400).json({
                success : false,
                message : "user not found "
            })
        }

        if(user.refreshToken !== refreshToken){
            return res.status(400).json({
                success : false,
                message : "wrong refreshToken"
            })
        }
        const payload = {
            userId: user._id,
            email: user.email
        };
        const accessToken = generateAccessToken(payload);
        
        return res.status(200).json({
            success: true,
            accessToken: accessToken
        });
    }
    catch(error){
        console.log(`Error in handleRefreshToken : ${error.message}`)
        return res.status(400).json({
            success : false,
            message : "Failed to refresh token."
        })
    }

}

export const Logout = async (req, res) => {
    const userId = req.user.userId;

    if(!userId){
        return res.status(400).json({
            success : false,
            message : "userId not found"
        })
    }
    
    const existingUser = await User.findById(userId);
    if(!existingUser){
        return res.status(400).json({
            success : false,
            message : "existingUser not found"
        })
    }

    existingUser.refreshToken = null;
    await existingUser.save();

    return res.status(200).json({
        success :  true,
        message : "Logout done"
    })
}