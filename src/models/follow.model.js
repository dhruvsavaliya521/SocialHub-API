import mongoose, {Schema} from "mongoose"

const followSchema = new Schema({
    follower: {
        type: Schema.Types.ObjectId, // one who is following
        ref: "User"
    },
    channal: {
        type: Schema.Types.ObjectId, // one to whom 'follower' is following
        ref: "User"
    }
}, {timestamps: true})


followSchema.index(
  { follower: 1, channal: 1 },
  { unique: true }
);




export const Follow = mongoose.model("Follow", followSchema)