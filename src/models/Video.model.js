import mongoose from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'


const videoSchema = new mongoose.Schema({
    videoFile:{
        type: String, //cloudnary
        required: true
    },
    thumbNail:{
        type: String, //cloudnary
        required: true
    },
    title:{
        type: String, 
        required: true
    },
    description:{
        type: String, 
        required: true
    },
    duration:{
        type: Number, 
        required: true
    },
    views:{
        type: Number,
        required: 0
    },
    isPublished:{
        type: Boolean, 
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},{
    timestamps: true
})

videoSchema.plugin(mongooseAggregatePaginate)

const Video = mongoose.model('Video', videoSchema)

export  {Video};