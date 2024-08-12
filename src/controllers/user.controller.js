import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/User.model.js";
import { ApiError } from "../utils/ApiError.js";
import zodUserSchema from "./Zodvalidation.js";
import { uploadFileCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        // console.log("user is ", user);
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        console.log("the access token is", accessToken)

        // we will save the refreshaccess token into the db
        user.refreshToken = refreshToken;
        //here when we will try to save the refreshtoken the mongoose method save will kick in and the password should be there because it is required
        // The option { validateBeforeSave: false } skips validation, which is useful if
        // you have required fields that are not being updated in this operation

        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.log("The internal error is: ", error)
        throw new ApiError(
            500, 
            "Something went wrong while generating refresh and access token: "
        );
    }
};
// we want to register the user
const registerUser = asyncHandler(async (req, res) => {
    //get user details from frontend
    //validation - not empty
    // check if user already eexist: username and email
    //check for images, check for avatar
    //upload them to cloudinart, avatar
    //create user object - create entry in db
    // remove password and refresh token field from response
    //check for user creation
    //return response

    //step 1:
    const userdetails = zodUserSchema.safeParse(req.body);
    // step 2:
    if (!userdetails.success) {
        throw new ApiError("Invalid user data", 400);
    }
    //step 3

    const existinguser = await User.findOne({
        $or: [
            { username: userdetails.data.username },
            { email: userdetails.data.email },
        ],
    });
    if (existinguser) {
        throw new ApiError("User already exists", 409);
    }
    //step 4:
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError("No avatar provided", 400);
    }
    // if (!coverImageLocalPath){
    //     throw new ApiError('No cover image provided', 400)
    // }
    //step 5:

    const avatar = await uploadFileCloudinary(avatarLocalPath);
    const coverImage = await uploadFileCloudinary(coverImageLocalPath);

    if (!avatar) {
        throw new ApiError("Failed to upload avatar to cloudinary", 500);
    }

    const userData = {
        ...userdetails.data,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    };

    const user = await User.create(userData);
    //step 6:
    // .select method which we dont want in resposne
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );
    // step 7:

    if (!createdUser) {
        throw new ApiError(
            "Something went wrong while registering the user",
            500
        );
    }

    // step 8:

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User registered Successfully")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    //todos

    //take the username and password from the user
    // check username and email is correct
    // find the user
    // check if the password is correct
    // generate the access and the refresh token
    // send the token to the user by coockies

    //step1
    const { username, email, password } = req.body;

    // step2
    if (!(username || email)) {
        throw new ApiError(400, "Username or password is required ");
    }

    //step3

    const user = await User.findOne({
        $or: [
            // here we can find the user either by username or email
            { username },
            { email },
        ],
    });
    // here we are checking twise

    if (!user) {
        throw new ApiError(400, "User does't exist");
    }

    //step 4:
    // here we r using the user not "User" because
    // isPasswordCorrect method is not inside the mongoose User model it inside the our user model which we got and the the findOne returns

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    //step 5:
    // generate the token
    // we will make a method so that we can reuse that
    console.log("user id on console:", user._id)

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );
    // right now we dont have the refreshtoken in the user because we run the access token generator fn later
    //so we have to either update the user obj or we have to call the db

    // user.refreshToken = refreshToken
    // await user.save(validateBeforeSave: false)

    const loggedInUser = await User.findById(user.id).select(
        "-password -refreshToken"
    );

    //step 6:
    // send the token to the user by cookies
    // By default  cockies can be modified by anyone in fron end
    // only can be modify from server

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                "User logged in successfully"
            )
        );
});
// to logout we have to delete the cookie and also reset the access token stored in db
const logoutUser = asyncHandler(async (req, res) => {
    //first will find the user by using auth middleware
    // then update the db with the refresh token field to null
    // then clear the cookie from the client side

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken:"",
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully:  "));
});

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookie.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(401, "unauthrized request")
    }

    //now we will check the coming refresh token is correct or not

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        if(!decodedToken) {
            throw new ApiError(403, "forbidden request")
        }
    
        //now will try to get access of the User
        const user = await User.findById(decodedToken?._id);
    
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
    
        // now compare the token to the db and generate new one
    
        if (incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(403, "refresh token is incvalid or use")
    
        }
    
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
    
        const options = {
            httpOnly: true,
            secure: true,
        };
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: user,
                    accessToken,
                    refreshToken: newRefreshToken
                },
                "User access token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong while refreshing the access token: " + error.message);
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    // we will get the current and new password from user
    // we will find the user by using auth middleware
    // we will compare the current password with the password in db
    // if they are not equal we will return error
    // if they are equal we will update the password in db
    // then we will return success message

    //TODO ADD DELETE IMAGE UTILL 

    const {currentPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id)

    if(!user){
        throw new ApiError(401, "unauthorized request")
    }

    // compare the password

    const isPasswordValid = await user.isPasswordCorrect(currentPassword)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid current password: " + currentPassword)
    }

    //update the password 
    user.password = newPassword;

    await user.save({validateBeforeSave: false})

    return res.status(400).json(
        new ApiResponse(
            200,
            {},
            "Password changed successfully"
        )
    )

})

const getCurrectUser = asyncHandler(async (req, res) => {

    // taking the user as request 

    const user = await User.findById(req.user?._id);

    // check wether the user exist

    if (!user){
        throw new ApiError(401, "unauthorized request")
    }

    return res.status(200)
    .json( 200,
        user,
        "current user fetched successfully"
    )
})

const updateAccountDetails =asyncHandler (async (req, res) => {
    // get the updated details from user
    // find the user by using auth middleware
    // update the user details in db
    // return success message

    const {username, fullName, email, } = req.body

    if(!username || !fullName || !email){
        throw new ApiError(400, "All fields are required: username, fullName, email")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email,
                username,
            }
        },
        {
            new: true,  // this obj returns the user after the updation
        }
    ).select("-password");

    if (!user){
        throw new ApiError(401, "unauthorized request")
    }
    
    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "user details updated successfully"
        )
    )

})

const updateUserAvatar = asyncHandler(async (req, res) => {
     //first we take the aavatar file
     // then we store the file on the cloudinary server
     // then we update the user avatar in db
     // then return success message

     const avatarLocalPath = req.file?.path

     if(!avatarLocalPath){
         throw new ApiError(400, "Please upload an avatar image")
     }

     const avatarCloudinaryPath = await uploadFileCloudinary(avatarLocalPath)

     if(!avatarCloudinaryPath){
         throw new ApiError(500, "Failed to upload the avatar to cloudinary")
     }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
    {
        $set: {
            avatar: avatarCloudinaryPath,
        },
    },
    {
        new: true
    }).select(
        "-password -refreshToken"
    )

    return res.
    status(200).
    json(
        new ApiResponse(
            200,
            user,
            "User avatar updated successfully"
        )
    )
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    //first we take the aavatar file
    // then we store the file on the cloudinary server
    // then we update the user avatar in db
    // then return success message

    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "Please upload an cover image")
    }

    const coverImageCloudinaryPath = await uploadFileCloudinary(coverImageLocalPath)

    if(!coverImageCloudinaryPath){
        throw new ApiError(500, "Failed to upload the cover image to cloudinary")
    }

   const user = await User.findByIdAndUpdate(
       req.user?._id,
   {
       $set: {
        coverImag: coverImageCloudinaryPath,
       },
   },
   {
       new: true
   }).select(
       "-password -refreshToken"
   )

   return res.
   status(200).
   json(
       new ApiResponse(
           200,
           user,
           "User avatar updated successfully"
       )
   )
})

// agrigate pipline returns array
const getUserChannelProfile = asyncHandler(async (req, res) => {

})

export { 
    registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword,
    getCurrectUser ,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
};
