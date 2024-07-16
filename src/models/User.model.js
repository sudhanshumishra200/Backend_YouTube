import mongoose from 'mongoose'
import jsonwebtoken from 'jsonwebtoken'
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
    },
    avatar: {
        type: String,// cloudnary url
        required: true,
    },
    avatar: {
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
        default: null
    },
},{
    timestamps: true,

})

userSchema.pre("save", async function(next) {
    if(!this.isModified('password')) return next()

    this.password= bcrypt.hash(this.password, 10)
    next()
})

// use for checking password is correct
userSchema.methods.isPasswordCorrect = async function(password) {

    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = async function(){
    jwt.sing({
        _id: this._id,
        email: this._email,
        username: this._username,
        fullName: this._fullName,

    },

    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.generateRefreshToken = async function(){}

export const User = mongoose.model('User', userSchema)
