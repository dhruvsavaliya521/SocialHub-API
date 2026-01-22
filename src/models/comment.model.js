import mongoose, { Schema } from "mongoose";

const commentSchema = new Schema({
  content: {
    type: String,
    required: true
  },

  commentBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  post: {
    type: Schema.Types.ObjectId,
    ref: "Post"
  },

  // reply to another comment
  comment: {
    type: Schema.Types.ObjectId,
    ref: "Comment"
  },

  tweet: {
    type: Schema.Types.ObjectId,
    ref: "Tweet"
  },

  // number of replies on this comment
  commentCount: {
    type: Number,
    default: 0
  }

}, { timestamps: true });


// validation: only one target allowed
commentSchema.pre("save", function (next) {
  const targets = [this.post, this.tweet, this.comment].filter(Boolean);
  if (targets.length !== 1) {
    return next(new Error("Comment must belong to exactly one entity"));
  }
  next();
});

export const Comment = mongoose.model("Comment", commentSchema);
