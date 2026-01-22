import { Router } from "express";
import { 
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
    getWatchHistory
} from "../controller/user.controller.js";

import {upload} from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router();



router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )


router.route("/login").post(upload.none(),loginUser)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/refresh-access-token").post(refreshAccessToken)
router.route("/change-current-password").post(verifyJWT,changeCurrentPassword)
router.route("/get-current-user").get(verifyJWT,getCurrentUser)
router.route("/change-text-field").patch(verifyJWT,changeTextField)
router.route("/update-user-avatar").patch(verifyJWT, upload.single("avatar"),updateUserAvatar)
router.route("/update-user-cover-image").patch(verifyJWT,upload.single("coverImage"), updateUserCoverImage)
router.route("/getchannal").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)






export default router ;