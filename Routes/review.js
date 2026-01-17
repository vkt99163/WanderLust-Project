const express= require("express");
const router= express.Router({mergeParams:true});
const Wrapasync = require("../upi/utils/Wrapasync.js")
const {validateReview,isLoggedIn, isReviewAuthor}= require("../middleware.js")
const reviewController= require("../controllers/review.js");




//Review:
//Post route:
router.post("/",isLoggedIn,validateReview,Wrapasync( reviewController.createReview));

//Delete Review Route:
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,Wrapasync(reviewController.destroyReview

));

module.exports=router
