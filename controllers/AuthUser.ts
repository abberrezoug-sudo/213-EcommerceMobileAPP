import { request, response} from "express"
import bcrypt from "bcrypt"
import User from "../models/User.js"
import jwt from "jsonwebtoken"
export const resisterUser = async (req = request, res = response) => {
  try{ 
    const { name, email, password } = req.body;
   //verifier si l'utilisateur exist
   const userExist = await User.findOne({email})
   if(userExist){
    return res.status(400).json({msg: "User already exist"})
   }
   //hach le mot de pass
   const salt = await bcrypt.genSalt(10)
   const hashedPassword = await bcrypt.hash(password, salt)
   const user = new User({
    name,
    email,
    password: hashedPassword
   })
   await user.save()
   res.status(201).json({msg: "User created successfully"})
 } catch (error) {
   res.status(500).json({msg: "Error creating user"})
 }
}
export const LoginUser = async(req = request, res = response)=>{
    try {
        const {email, password} = req.body
        //verfier si user exist
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({msg: "User not found"})
        }
        //verifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            return res.status(400).json({msg: "Invalid credentials"})
        }
//GENERATE toCKEN
 const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });      
    } catch (error) {
        res.status(500).json({msg: "Error logging in user"})
    }
}