import mongoose from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'


const CommentSchema = new mongoose.Schema({

    content: {
        type: String,
        required: true,
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


CommentSchema.plugin(mongooseAggregatePaginate) // it allows u to write aggrigation queries

export const Comment = mongoose.model('Comment', CommentSchema) // It will store in database in lowecase
