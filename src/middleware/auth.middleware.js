import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"




// we can write instead of res "_"
export  const verifyJWT = asyncHandler(async (req, res,
    next) => {
       try {
         const  token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
         if (!token){
             throw new ApiError(401, "Unauthorzed request")
         }
         // here we are decoding the token 
 
         const decodedtoken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
 
         const user = await User.findById(decodedtoken?._id)
         .select("-password -refreshToken")
 
         if (!user){
             //discuss about the frontend
             throw new ApiError(401, "Invalid accessToken")
         }
         // here we have the access of the req and we want to add a new object 
         // to the req object named user
         req.user = user;
         next()
       } catch (error) {
        throw new ApiError(401, error?.message || 
            "Invalid access token"
        );
       }
})