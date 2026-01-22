import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const postSchema = new Schema(
    {
        file: {
            type: String, //cloudinary url
            required: true
        },
        caption: {
            type: String,
            default:""
        },
        views: {
            type: Number,
            default: 0
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        likeCount:{
            type:Number,
            default: 0
        },
        commentCount:{
            type:Number,
            default: 0
        }

    }, 
    {
        timestamps: true
    }
)

postSchema.plugin(mongooseAggregatePaginate)

export const Post = mongoose.model("Post", postSchema)