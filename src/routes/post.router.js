import { Router } from "express";
import {newPost, deletePost,getPost , likeList , commentList , togglePublicStatus } from "../controller/post.controller.js";
import {upload} from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router();





router.route("/new-post").post(verifyJWT,
    upload.fields([
        {
            name: "post",
            maxCount: 1
        }
    ]),newPost)
router.delete("/delete-post/:postId", verifyJWT, deletePost);
router.post("/get-post", verifyJWT, getPost);
router.post("/like-list", verifyJWT, likeList);
router.post("/comment-list", verifyJWT, commentList);
router.route("/toggle-public-status").post(verifyJWT,togglePublicStatus);





export default router ;