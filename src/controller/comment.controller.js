import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { Post } from "../models/post.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js"




const addComentonPost = asyncHandler(async function (req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { post_id, content } = req.body;

        if (!content) {
            throw new ApiError(400, "Comment content is required");
        }

        if (!mongoose.Types.ObjectId.isValid(post_id)) {
            throw new ApiError(400, "Invalid post id");
        }

        const postExists = await Post.findById(post_id).session(session);
        if (!postExists) {
            throw new ApiError(404, "Post does not exist");
        }

        const newComment = await Comment.create(
            [{
                content,
                commentBy: req.user._id,
                post: post_id
            }],
            { session }
        );

        await Post.findByIdAndUpdate(
            post_id,
            { $inc: { commentCount: 1 } },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json(
            new ApiResponse(201, newComment[0], "New comment added")
        );

    } catch (e) {
        await session.abortTransaction();
        session.endSession();

        if (e instanceof ApiError) throw e;
        throw new ApiError(500, e.message || "Comment failed");
    }
});


const addComentontweet = asyncHandler(async function (req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { tweet_id, content } = req.body;

        if (!content) {
            throw new ApiError(400, "Comment content is required");
        }

        if (!mongoose.Types.ObjectId.isValid(tweet_id)) {
            throw new ApiError(400, "Invalid tweet id");
        }

        const tweetExists = await Tweet.findById(tweet_id).session(session);
        if (!tweetExists) {
            throw new ApiError(404, "tweet does not exist");
        }

        const newComment = await Comment.create(
            [{
                content,
                commentBy: req.user._id,
                tweet: tweet_id
            }],
            { session }
        );

        await Tweet.findByIdAndUpdate(
            tweet_id,
            { $inc: { commentCount: 1 } },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json(
            new ApiResponse(201, newComment[0], "New comment added")
        );

    } catch (e) {
        await session.abortTransaction();
        session.endSession();

        if (e instanceof ApiError) throw e;
        throw new ApiError(500, e.message || "Comment failed");
    }
});

const addComentoncomment = asyncHandler(async function (req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { comment_id, content } = req.body;

        if (!content) {
            throw new ApiError(400, "Comment content is required");
        }

        if (!mongoose.Types.ObjectId.isValid(comment_id)) {
            throw new ApiError(400, "Invalid comment id");
        }

        const commentExists = await Comment.findById(comment_id).session(session);
        if (!commentExists) {
            throw new ApiError(404, "comment does not exist");
        }

        const newComment = await Comment.create(
            [{
                content,
                commentBy: req.user._id,
                comment: comment_id
            }],
            { session }
        );

        await Comment.findByIdAndUpdate(
            comment_id,
            { $inc: { commentCount: 1 } },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json(
            new ApiResponse(201, newComment[0], "New comment added")
        );

    } catch (e) {
        await session.abortTransaction();
        session.endSession();

        if (e instanceof ApiError) throw e;
        throw new ApiError(500, e.message || "Comment failed");
    }
});//as replys to comments 

const deleteComment = asyncHandler(async function (req, res) {
    let { commentId } = req.params;
    commentId = commentId?.trim();
    if (!commentId) {
        throw new ApiError(400, "Comment id is required");
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }
    //check if the user is the owner of the comment
    if (comment.commentBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }
    await Comment.findByIdAndDelete(commentId);
    return res
        .status(200)
        .json(
            new ApiResponse(200, null, "Comment deleted successfully")
        );
});

const commentReplyList = asyncHandler(async function (req, res) {
    const { comment_id } = req.body
    if (!comment_id) {
        throw new ApiError(400, "plese give comment id ")
    }
    if (!mongoose.isValidObjectId(comment_id)) {
        throw new ApiError(400, "Invalid comment id");
    }

    const list = await Comment.aggregate([
        {
            $match: {
                "_id": new mongoose.Types.ObjectId(comment_id)
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "comment",
                as: "commentReplies"
            }
        }
    ])

    if (!list.length) {
        throw new ApiError(404, "Comment not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200,
            list[0].commentReplies,
            "comment replies fetched succesfully "
        ))
})

const getComment = asyncHandler(async function (req, res) {

    const { comment_id } = req.body
    if (!comment_id) {
        throw new ApiError(400, "plese give comment id ")
    }
    if (!mongoose.isValidObjectId(comment_id)) {
        throw new ApiError(400, "Invalid comment id");
    }


    const comment = await Comment.findById(comment_id)

    if (!comment) {
        throw new ApiError(404, "comment does not exits ")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "comment fetched successfully"))


})

const commentLikesList = asyncHandler(async function (req, res) {
    const { comment_id } = req.body
    if (!comment_id) {
        throw new ApiError(400, "plese give comment id ")
    }
    if (!mongoose.isValidObjectId(comment_id)) {
        throw new ApiError(400, "Invalid comment id");
    }

    const list = await Comment.aggregate([
        {
            $match: {
                "_id": new mongoose.Types.ObjectId(comment_id)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "commentLikes"
            }
        }
    ])

    if (!list.length) {
        throw new ApiError(404, "Comment not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200,
            list[0].commentLikes,
            "comment likes list fetched succesfully "
        ))
})

export { addComentonPost, addComentontweet, addComentoncomment, deleteComment ,commentReplyList ,getComment , commentLikesList }


//get comment list or perticular comment on post anywhere 