import asyncHandler from '../utils/asyncHandler.js'
import User from '../models/User.model.js'


// we want to register the user 
const registerUser = asyncHandler(async (req,res) => {
    //get user details from frontend
    //validation - not empty
    // check if user already eexist: username and email
    //check for images, check for avatar
    //upload them to cloudinart, avatar 
    //create user object - create entry in db 
    // remove password and refresh token field from response
    //check for user creation 
    //return response
})

export {registerUser}