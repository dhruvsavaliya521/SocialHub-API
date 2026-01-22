import mongoose, {Schema} from "mongoose"

const likeSchema = new Schema({
    likedBy: {
        type: Schema.Types.ObjectId, 
        ref: "User"
    },
    post: {
        type: Schema.Types.ObjectId, 
        ref: "Post"
    },
    comment:{
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    tweet:{
        type: Schema.Types.ObjectId,
        ref: "Tweet"
    }
    
}, {timestamps: true})

likeSchema.index(
  { post: 1, likedBy: 1 },
  { unique: true, partialFilterExpression: { post: { $exists: true } } }
);
likeSchema.index(
  { comment: 1, likedBy: 1 },
  { unique: true, partialFilterExpression: { comment: { $exists: true } } }
);
likeSchema.index(
  { tweet: 1, likedBy: 1 },
  { unique: true, partialFilterExpression: { tweet: { $exists: true } } }
);




export const Like = mongoose.model("Like", likeSchema)