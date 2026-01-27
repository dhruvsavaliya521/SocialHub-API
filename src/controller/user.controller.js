import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


//have to read about token and cookies 

const generateTokens = async (userId) => {
    const user = await User.findById(userId).select("+refreshToken");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async function (req, res) {
    // get {fullName, email, username, password } form req 
    // validation 
    // handel avtar and cover image 
    // register new user in db 
    // return success message 

    const { fullName, email, username, password } = req.body




    // VALIDATION :

    //idel 
    // if([fullName, email, username, password].some((field) => !field ||field.trim() === "")){
    //     throw new ApiError(400, "All field are required")
    // }


    // my code :
    // for (const f of [fullName, email, username, password]) {
    //     if (!f || f.trim() === "") {
    //         throw new ApiError(400, `${f} is required`); // f =""
    //     }
    // }


    //better one :
    const fields = { fullName, email, username, password };

    for (const [key, value] of Object.entries(fields)) {
        if (!value || value.trim() === "") {
            throw new ApiError(400, `${key} is required`);
        }
    }



    // CHECK FOR EXISTENCE 

    const exitedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (exitedUser) {
        throw new ApiError(409, "user already exits")
    }


    // ===== AVATAR (OPTIONAL) =====
    let avatar;
    const avatarLocalPath = req.files?.avatar?.[0]?.path;

    if (avatarLocalPath) {
        avatar = await uploadOnCloudinary(avatarLocalPath);


        if (!avatar || !avatar.url) {
            throw new ApiError(500, "Avatar upload failed");
        }
    }





    // ===== COVER IMAGE (OPTIONAL) =====
    let coverImage;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if (!coverImage || !coverImage.url) {
            throw new ApiError(500, "Cover image upload failed");
        }
    }


    // creating new user 

    const user = await User.create({
        fullName,
        avatar: avatar?.url || "",
        coverImage: coverImage?.url || "",
        email,
        password,
        username
    });



    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "something went worng while registring new user plese try again ")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User regiter successfully")
    )
})

const loginUser = asyncHandler(async function (req, res) {

    //algo 


    // data from req 
    //validation 
    //access and refresh token 



    const { username, email, password } = req.body


    if (!username && !email) {
        throw new ApiError(501, "username or password any one is required ")
    }

    const getUser = await User.findOne({
        $or: [{ username }, { email }]
    }).select("+password")

    if (!getUser) {
        throw new ApiError(502, "user with this email id does not exits ")
    }
    if (!password) {
        throw new ApiError(400, "please enter passsword")
    }
    //password validation 
    const ispasscorrect = await getUser.isPasswordcorrect(password)

    if (!ispasscorrect) {
        throw new ApiError(502, "password incorrect ")
    }

    //genrating tokens 
    const { accessToken, refreshToken } = await generateTokens(getUser._id)


    //one extra db query we can avoid 

    const currloginUser = await User.findById(getUser._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    //returning responce 
    return res
        .status(202)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                202,
                {
                    user: currloginUser, accessToken, refreshToken
                },
                "user login success full"
            )
        )



})

const logoutUser = asyncHandler(async function (req, res) {

    await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user logged out "))
})

// req.cookies.refreshToken.trim() || IMP
const refreshAccessToken = asyncHandler(async function (req, res) {

    const incomingrefreshToken = req.cookies.refreshToken.trim() || req.body.refreshToken.trim();


    if (!incomingrefreshToken) {
        throw new ApiError(401, "uneuthorize request ")
    }
    try {

        const decodedToken = jwt.verify(incomingrefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("+refreshToken");

        // console.log(user);
        // console.log(user.refreshToken)


        if (!user) {
            throw new ApiError(401, "Invalid Refresh Token")
        }

        // console.log("incoming type:", typeof incomingrefreshToken);
        // console.log("db type:", typeof user.refreshToken);

        // console.log("incoming len:", incomingrefreshToken.length);
        // console.log("db len:", user.refreshToken.length);

        // console.log("incoming:", JSON.stringify(incomingrefreshToken));
        // console.log("db:", JSON.stringify(user.refreshToken));


        // console.log(incomingrefreshToken);

        if ((incomingrefreshToken !== user.refreshToken)) {
            throw new ApiError(401, "refresh token is expired ")
        }
        console.log("cond is true ");


        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, refreshToken } = await generateTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: refreshToken },
                    "Access token refreshed"
                )
            )

    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token ")

    }
})

const changeCurrentPassword = asyncHandler(async function (req, res) {

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword) {
        throw new ApiError(400, "old password is required ")
    }
    if (!newPassword) {
        throw new ApiError(400, "new password is required ")
    }


    const user = await User.findById(req.user._id).select("+password");

    const isPasswordCorrect = await user.isPasswordcorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }


    user.password = newPassword;
    await user.save({
        validateBeforeSave: false
    });

    return res
        .status(201)
        .json(
            new ApiResponse(200,
                {},
                "password has been changed "
            )
        )
})

// my code :
// const getCurrentUser = asyncHandler(async function (req, res) {
//     const user = await User.findById(req.user._id).select("-password -refreshToken");

//     if(!user){
//         throw new ApiError(500,"plese login")
//     }

//     return res
//     .status(200)
//     .json(
//         new ApiResponse(200,
//             user,
//             "succesusfull"
//         )
//     )  
// })
//good one :
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(
            200,
            req.user,
            "User fetched successfully"
        ))
})

// const changeField = async function(field,name,user){
//     user.name = field;
//     await user.save({validateBeforeSave:false})
// }

const changeTextField = asyncHandler(async (req, res) => {
    const { name, value } = req.body;

    if (!name || !value) {
        throw new ApiError(400, "Field name and value are required");
    }

    const allowedFields = [
        "fullName",
        "username",
        "email"
    ];

    if (!allowedFields.includes(name)) {
        throw new ApiError(400, "This field cannot be updated");
    }

    const user = req.user;

    user[name] = value; // ✅ correct dynamic update
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, user, "Field updated successfully")
    );
});

const updateUserAvatar = asyncHandler(async (req, res) => {

    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing ")
    }

    if (req.user.avatarPublicId) {
        await deleteFromCloudinary(req.user.avatarPublicId);
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(500, "Error while uploding on cloudinary ")
    }

    req.user.avatar = avatar.url;
    await req.user.save({ validateBeforeSave: false });
    return res.status(200).json(
        new ApiResponse(200, req.user, "avatar updated successfully")
    );
});

const updateUserCoverImage = asyncHandler(async (req, res) => {

    const coverImagePath = req.file?.path

    if (!coverImagePath) {
        throw new ApiError(400, "Avatar file is missing ")
    }

    if (req.user.coverImagePublicId) {
        await deleteFromCloudinary(req.user.coverImagePublicId);
    }

    const coverImage = await uploadOnCloudinary(avatrarLocalPath);

    if (!coverImage.url) {
        throw new ApiError(500, "Error while uploding on cloudinary ")
    }

    req.user.CoverImage = coverImage.url;
    await req.user.save({ validateBeforeSave: false });
    return res.status(200).json(
        new ApiResponse(200, req.user, "avatar updated successfully")
    );
});

//mongo db aggration :

const getUserChannelProfile = asyncHandler(async (req, res) => {
    // console.log(req.user);
    const username = req.user.username

    console.log(username)
    if (!username) {
        throw new ApiError(400, "please enter username")
    }
    const channal = await User.aggregate([
        {
            $match: {
                username: req.user.username
            }
        },
        {
            $lookup: {
                from: "follow",
                localField: "_id",
                foreignField: "channal",
                as: "follower"
            }
        },
        {
            $lookup: {
                from: "follow",
                localField: "_id",
                foreignField: "follower",
                as: "followed"
            }
        },
        {
            $addFields: {
                followerList: "$follower",
                follwedList: "$followed",
                isFollowed: {
                    $cond: {
                        if: { $in: [req?.user._id, "$follower.follower"] },
                        then: true,
                        else: false
                    }
                }
            }
        }

    ])

    if (!channal.lenth) {
        throw new ApiError(400, "channal does not exits ")
    }

    res
        .status(200)
        .json(
            new ApiResponse(200,
                channal[0],
                "user channal fetched succesfully "
            )
        )
});

const getWatchHistory = asyncHandler(async (req, res) => {

    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)  //IMP 
            }
        },
        {
            $lookup: {
                from: "post",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "user",
                            localField: "owner",
                            foreignField: "_id ",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    res
        .status(200)
        .json(
            new ApiResponse(200,
                user,
                "Watch history fetched successfull"
            )
        )


});



const getPostlistofown = asyncHandler(async function (req, res) {

    const list = await User.aggregate([
        {
            $match: {
                "_id": new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "posts",
                localField: "_id",
                foreignField: "owner",
                as: "postList"
            }
        }
    ])

    if (!list.length) {
        throw new ApiError(404, "post not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200,
            list[0].postList,
            "users post list fetched succesfully "
        ))
})

const getPostlistofOtherUser = asyncHandler(async function (req, res) {
    const { user_id } = req.body
    if (!user_id) {
        throw new ApiError(400, "plese give user id ")
    }
    if (!mongoose.isValidObjectId(user_id)) {
        throw new ApiError(400, "Invalid user id");
    }

    const list = await User.aggregate([
        {
            $match: {
                "_id": new mongoose.Types.ObjectId(user_id)
            }
        },
        {
            $lookup: {
                from: "posts",
                localField: "_id",
                foreignField: "owner",
                as: "postList"
            }
        }
    ])

    if (!list.length) {
        throw new ApiError(404, "post not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200,
            list[0].postList,
            "users post list fetched succesfully "
        ))
})


const getLikedPostlist = asyncHandler(async function (req, res) {
    // const { post_id } = req.body

    // if (!post_id) {
    //     throw new ApiError(400, "plese give post id ")
    // }
    // if (!mongoose.isValidObjectId(post_id)) {
    //     throw new ApiError(400, "Invalid post id");
    // }

    const list = await User.aggregate([
        {
            $match: {
                "_id": new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "likedBy",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "posts",
                localField: "likes.post",
                foreignField: "_id",
                as: "likedPosts"
            }
        }
    ])

    if (!list.length) {
        throw new ApiError(404, "post not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200,
            list[0].likedPosts,
            "liked post list fetched succesfully "
        ))
})

const getSavedPostlist = asyncHandler(async function (req, res) {




})// need to make new schema 

const getCommentlist = asyncHandler(async function (req, res) {
    const list = await User.aggregate([
        {
            $match: {
                "_id": new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "commentBy",
                as: "comments"
            }
        },
        {
            $lookup: {
                from: "posts",
                localField: "comments.post",
                foreignField: "_id",
                as: "commentedPosts"
            }
        }
    ])

    if (!list.length) {
        throw new ApiError(404, "post not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200,
            list[0].commentedPosts,
            "commented post list fetched succesfully "
        ))



})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    changeTextField,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
    getPostlistofown,
    getPostlistofOtherUser,
    getLikedPostlist,
    getSavedPostlist,
    getCommentlist
}






// registerUser, => done

// loginUser,=> done
// logoutUser,=> done
// refreshAccessToken,
// changeCurrentPassword,
// getCurrentUser,
// updateAccountDetails,
// updateUserAvatar,
// updateUserCoverImage,
// getUserChannelProfile,
// getWatchHistory


//steps for regitering user


// get needed info form req
// validation then
// check for uniquneess
// deal with images and files
// create new object and save in db
// send status code or message and responce (remove password )




/// post
// follower--|
//           |-> aggregate pipeline
// likes-----|
// comments--| (with extra field message )
// posts
// follower and followed list 