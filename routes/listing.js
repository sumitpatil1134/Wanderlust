const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema}=require("../schema.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing}=require("../middleware.js"); 
const User = require("../models/user");
const listingController=require("../controllers/listing.js");
const multer  = require('multer');
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage });

router.route("/")
.get(
  validateListing,
  wrapAsync(listingController.index)
)
.post(
  isLoggedIn,
  upload.single('listing[image]'),
  validateListing,
  wrapAsync(listingController.createListing)
);

// ================== NEW ==================
router.get("/new",isLoggedIn, listingController.renderNewForm);

router.route("/:id")
.get(
  wrapAsync(listingController.showListing)
)
.put(
  isLoggedIn,isOwner,
   upload.single('listing[image]'),
   validateListing,
  wrapAsync(listingController.upadteListing)
)
.delete(
  isLoggedIn,isOwner,
  wrapAsync(listingController.deleteListing)
);


// ================== EDIT ==================
router.get(
  "/:id/edit",validateListing,isLoggedIn,isOwner,
  wrapAsync(listingController.renderEditForm)
);


module.exports=router;
