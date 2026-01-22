import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import {Post} from "../models/post.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

const newPost = asyncHandler(async function (req, res) {

    let { caption } = req.body;
    // if (!caption) {
    //     caption = "new post"
    // }
    let post;
    const postLocalPath = req.files?.post?.[0]?.path;

    if (!postLocalPath) {
        throw new ApiError(400, "file is required ")

    }
    post = await uploadOnCloudinary(postLocalPath);


    if (!post || !post.url) {
        throw new ApiError(500, "file upload failed");
    }

    const newPost = await Post.create({
        file:post.url,
        caption:caption,
        owner:req.user._id
    })

    if(!newPost){
        throw new ApiError(400, "error in db entry")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(201, newPost, "new Post uploded ")
    )
})

const deletePost = asyncHandler(async function (req, res) {
  console.log(req.params);
  let { postId } = req.params;
  postId = postId?.trim();


  if (!postId) {
    throw new ApiError(400, "Post id is required");
  }

  // find post
  const post = await Post.findById(postId);
  if (!post) {
    throw new ApiError(404, "Post not found");
  }

  // only owner can delete
  if (post.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to delete this post");
  }

  // delete file from cloudinary (if exists)
  if (post.file) {
    try {
      await deleteFromCloudinary(post.file);
    } catch (err) {
      throw new ApiError(500, "Failed to delete file from cloud");
    }
  }

  // delete post from DB
  await Post.findByIdAndDelete(postId);

  return res.status(200).json(
    new ApiResponse(200, {}, "Post deleted successfully")
  );
});

export {newPost, deletePost };


//post list 
//random post for user (explore)
//post update 