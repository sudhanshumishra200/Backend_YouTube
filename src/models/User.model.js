import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,// cloudnary url
        required: true,
    },
    coverImage: {
        type: String,// cloudnary url
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    refreshToken: {
        type: String,
    },
},{
    timestamps: true,

})

// it is a mongoose hook  which will be executed before the password saved in the db  it will encrypt the password then save them 
userSchema.pre("save", async function(next) {
    if(!this.isModified('password')) return next()

    this.password= await bcrypt.hash(this.password, 10) // we have the bcrypt library to encrypt and decrypt passwords 
    next()
})

// we can make method in mongoose and we can inject methods (costom methodes method.)
userSchema.methods.isPasswordCorrect = async function(password) {

    return await bcrypt.compare(password, this.password) // bcrypt lib also can check the password
}

userSchema.methods.generateAccessToken = async function(){ // we have injected a method in the user schema which will generate the access token. access token 
    //is short lived token and refresh token is littile long lived token
    return jwt.sign({ //payload
        _id: this._id,
        email: this._email,
        username: this._username,
        fullName: this._fullName,

    },

    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPRIRY
    }
)
}
userSchema.methods.generateRefreshToken = async function(){
    return  jwt.sign({ //payload
        _id: this._id,

    },

    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPRIRY
    }
)
}

export const User = mongoose.model('User', userSchema)
// The User will be saved inside the  database as small letter
