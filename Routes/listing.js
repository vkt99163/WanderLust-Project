const express = require("express");
const router = express.Router();
const Wrapasync = require("../upi/utils/Wrapasync.js")
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js")
const listingController= require("../controllers/listing.js")

const multer  = require('multer')
const {storage}= require("../cloudConfig.js")
const upload = multer({ storage })



//index Route

router.get("/",Wrapasync( listingController.index));


//new Route
router.get("/new", isLoggedIn, listingController.renderNewForm) 

//Add new listing Route:
router.post("/", validateListing,upload.single("listing[image]"),
 Wrapasync(listingController.createListing));

//show route
router.get("/:id", Wrapasync(listingController.showListing))



//Edit Listing
router.get("/:id/edit", isLoggedIn, Wrapasync(listingController.renderEditForm))
//Update
router.put("/:id", isOwner, isLoggedIn,upload.single("listing[image]"), validateListing, Wrapasync(listingController.updateListing))

//Delete Route 
router.delete("/:id", isLoggedIn, Wrapasync(listingController.destoryListing));

module.exports = router