import mongoose from "mongoose";

const TweetSchema = new mongoose.Schema({
    content:{
        type: String,
        required: true,
        maxLength: 280
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    
}, {
    timestamps: true
})


export const Tweet  = mongoose.model('Tweet', TweetSchema)