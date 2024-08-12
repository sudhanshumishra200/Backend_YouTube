import mongoose from 'mongoose'


const PlaylistSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },
    description:{
        type: String,
        required: true,
        trim: true
    },
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    owenr: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }


}, {
    timestamps: true,
})


export const Playlist = mongoose.model('Playlist', PlaylistSchema)
