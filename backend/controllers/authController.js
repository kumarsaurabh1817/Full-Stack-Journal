import User from '../models/userModel.js';
import { getHashedPassword, handleComparePassword } from '../utils/helper.js';
import jwt from "jsonwebtoken"

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

        const token = jwt.sign(
                {
                    userId: existingUser._id,
                    email: existingUser.email
                },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
            );
        
        return res.status(200).json({ success : true,                 
            data: {
                    userId: existingUser._id,
                    email: existingUser.email,
                    token: token,
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