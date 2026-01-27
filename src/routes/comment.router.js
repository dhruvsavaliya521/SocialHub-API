import { Router } from "express";
import { addComentonPost,addComentontweet,addComentoncomment,deleteComment,commentReplyList ,getComment , commentLikesList} from "../controller/comment.controller.js";
import {upload} from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router();




router.route("/add-comment-post").post(verifyJWT,addComentonPost)
router.route("/add-comment-tweet").post(verifyJWT,addComentontweet)
router.route("/add-comment-reply").post(verifyJWT,addComentoncomment)
router.route("/delete-comment/:commentId").delete(verifyJWT,deleteComment)
router.route("/comment-reply-list").post(verifyJWT,commentReplyList)
router.route("/get-comment").post(verifyJWT,getComment)
router.route("/comment-likes-list").post(verifyJWT,commentLikesList)




export default router ;