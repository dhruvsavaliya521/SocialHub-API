import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { Follow } from "../models/follow.model.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";


const newFollow = asyncHandler(async function (req, res) {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const follower = req.user._id;

        if (!follower) {
            throw new ApiError(400, "plese login")
        }
        const { toFollow_username } = req.body;
        if (!toFollow_username) {
            throw new ApiError(400, "Username is required");
        }



        const channal = await User.findOne({ username: toFollow_username }).session(session);

        if (!channal) {
            throw new ApiError(400, "following channal does not exits")
        }
        if (follower.toString() === channal._id.toString()) {
            throw new ApiError(400, "You cannot follow yourself");
        }

        const alreadyFollowed = await Follow.findOne({
            follower,
            channal: channal._id
        }).session(session);;

        if (alreadyFollowed) {
            throw new ApiError(400, "Already following this user");
        }
        const newFollower = await Follow.create([{
            follower: follower,
            channal: channal._id
        }], { session }) // use array when there is transaction mode

        if (!newFollower) {
            throw new ApiError(400, "error in db entry")
        }
        //upadting value of follower and following count in user model ;
        // channal.followerCount += 1;
        // req.user.followedCount += 1;
        // const toFollowuser = await channal.save();
        // if (!toFollowuser) {
        //     throw new ApiError(400, "error in db entry")
        // }
        // const followeruser = await req.user.save();
        // if (!followeruser) {
        //     channal.followerCount -= 1;
        //     const toFollowuser = await channal.save();
        //     if (!toFollowuser) {
        //         throw new ApiError(400, "error in db entry")
        //     }
        //     throw new ApiError(400, "error in db entry")
        // }// my idea 


        //using trasaction :
        await User.findByIdAndUpdate(channal._id,
            { $inc: { followerCount: 1 } },
            { session }
        )

        await User.findByIdAndUpdate(follower,
            { $inc: { followedCount: 1 } },
            { session }
        )
        await session.commitTransaction();
        session.endSession();

        return res
            .status(201)
            .json(
                new ApiResponse(201, newFollower[0], "new follower added")
            )
    } catch (e) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(500, e.message || "Follow failed");
    }

})


const unFollow = asyncHandler(async function (req, res) {

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const follower = req.user._id;

        if (!follower) {
            throw new ApiError(400, "plese login")
        }
        const { toFollow_username } = req.body;
        if (!toFollow_username) {
            throw new ApiError(400, "Username is required");
        }
        const channal = await User.findOne({ username: toFollow_username }).session(session);

        if (!channal) {
            throw new ApiError(400, "following channal does not exits")
        }
        const followDoc = await Follow.findOne({
            follower,
            channal: channal._id
        }).session(session);

        if (!followDoc) {
            throw new ApiError(400, "You are not following this user");
        }

        // 🗑 delete follow relation
        await Follow.deleteOne(
            { follower, channal: channal._id },
            { session }
        );

        //using trasaction :
        await User.findByIdAndUpdate(channal._id,
            { $inc: { followerCount: -1 } },
            { session }
        )

        await User.findByIdAndUpdate(follower,
            { $inc: { followedCount: -1 } },
            { session }
        )
        await session.commitTransaction();
        session.endSession();

        return res
            .status(201)
            .json(
                new ApiResponse(201, {}, "unfollowed successfully")
            )
    } catch (e) {
        await session.abortTransaction();
        session.endSession();
        throw new ApiError(500, e.message || "unFollow failed");
    }

})


export {newFollow,unFollow}

//get follwer and followed list 