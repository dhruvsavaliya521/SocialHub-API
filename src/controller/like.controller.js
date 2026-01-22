import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { Post } from "../models/post.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js"
import {Like} from "../models/like.model.js"
import { Tweet } from "../models/tweet.model.js";



const addLikeonPost = asyncHandler(async function (req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { post_id} = req.body;

        

        if (!mongoose.Types.ObjectId.isValid(post_id)) {
            throw new ApiError(400, "Invalid post id");
        }

        const postExists = await Post.findById(post_id).session(session);
        if (!postExists) {
            throw new ApiError(404, "Post does not exist");
        }

        const alreadyLiked = await Like.findOne({
            post:post_id,
            likedBy:req.user._id
        }).session(session);

        if(alreadyLiked){
            throw new ApiError(400,"Already liked this post")
        }

        const newLike = await Like.create(
            [{
                likedBy: req.user._id,
                post: post_id
            }],
            { session }
        );

        await Post.findByIdAndUpdate(
            post_id,
            { $inc: { likeCount: 1 } },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json(
            new ApiResponse(201, newLike[0], "New Like added")
        );

    } catch (e) {
        await session.abortTransaction();
        session.endSession();

        if (e instanceof ApiError) throw e;
        throw new ApiError(500, e.message || "Like failed");
    }
});

const addLikeoncomment = asyncHandler(async function (req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { comment_id} = req.body;

        

        if (!mongoose.Types.ObjectId.isValid(comment_id)) {
            throw new ApiError(400, "Invalid comment id");
        }

        const commentExists = await Comment.findById(comment_id).session(session);
        if (!commentExists) {
            throw new ApiError(404, "comment does not exist");
        }

        const alreadyLiked = await Like.findOne({
            comment:comment_id,
            likedBy:req.user._id
        }).session(session);

        if(alreadyLiked){
            throw new ApiError(400,"Already liked this comment")
        }

        const newLike = await Like.create(
            [{
                likedBy: req.user._id,
                comment: comment_id
            }],
            { session }
        );

        await Comment.findByIdAndUpdate(
            comment_id,
            { $inc: { likeCount: 1 } },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json(
            new ApiResponse(201, newLike[0], "New Like added")
        );

    } catch (e) {
        await session.abortTransaction();
        session.endSession();

        if (e instanceof ApiError) throw e;
        throw new ApiError(500, e.message || "Like failed");
    }
});

const addLikeontweet = asyncHandler(async function (req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { tweet_id} = req.body;

        

        if (!mongoose.Types.ObjectId.isValid(tweet_id)) {
            throw new ApiError(400, "Invalid tweet id");
        }

        const tweetExists = await Tweet.findById(tweet_id).session(session);
        if (!tweetExists) {
            throw new ApiError(404, "tweet does not exist");
        }

        const alreadyLiked = await Like.findOne({
            tweet:tweet_id,
            likedBy:req.user._id
        }).session(session);

        if(alreadyLiked){
            throw new ApiError(400,"Already liked this tweet")
        }

        const newLike = await Like.create(
            [{
                likedBy: req.user._id,
                tweet: tweet_id
            }],
            { session }
        );

        await Tweet.findByIdAndUpdate(
            tweet_id,
            { $inc: { likeCount: 1 } },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json(
            new ApiResponse(201, newLike[0], "New Like added")
        );

    } catch (e) {
        await session.abortTransaction();
        session.endSession();

        if (e instanceof ApiError) throw e;
        throw new ApiError(500, e.message || "Like failed");
    }
});

const deleteLike = asyncHandler(async function (req, res) {
    const session = await mongoose.startSession();
    session.startTransaction(); 
    try {
        const { likeId } = req.params;  
        if (!mongoose.Types.ObjectId.isValid(likeId)) {
            throw new ApiError(400, "Invalid like id");
        }
        const likeDoc = await Like.findById(likeId).session(session);
        if (!likeDoc) {
            throw new ApiError(404, "Like not found");
        }
        await Like.deleteOne({ _id: likeId }, { session });
        // Decrement like count on the associated post, comment, or tweet
        if (likeDoc.post) {
            await Post.findByIdAndUpdate(
                likeDoc.post,
                { $inc: { likeCount: -1 } },
                { session }
            );
        } else if (likeDoc.comment) {
            await

    Comment.findByIdAndUpdate(  
                likeDoc.comment,
                { $inc: { likeCount: -1 } },
                { session }
            );
        } else if (likeDoc.tweet) {
            await Tweet.findByIdAndUpdate(
                likeDoc.tweet,  
                { $inc: { likeCount: -1 } },
                { session }
            );
        }
        await session.commitTransaction();
        session.endSession();
        return res.status(200).json(
            new ApiResponse(200, null, "Like removed successfully")
        );
    } catch (e) {
        await session.abortTransaction();
        session.endSession();
        if (e instanceof ApiError) throw e;
        throw new ApiError(500, e.message || "Failed to remove like");
    }
});

export{addLikeonPost,addLikeoncomment,addLikeontweet,deleteLike}


// unlike functions
// like list on post or tweet 