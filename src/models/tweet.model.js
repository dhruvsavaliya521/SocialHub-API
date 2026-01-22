import mongoose, { Schema } from "mongoose"

const tweetSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    owener: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    likeCount: {
        type: Number
    },
    commentCount: {
        type: Number
    }
}, { timestamps: true })



export const Tweet = mongoose.model("Tweet", tweetSchema)