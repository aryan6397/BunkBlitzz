const express = require("express");
const router = express.Router();
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/list.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {isLoggedIn} = require("../middleware.js");
const listingControlleer = require("../controllers/listing.js");
const multer  = require('multer')
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

const Joi = require('joi');

const {listingSchema, reviewSchema} = require("../schema.js");


const validateListing = (req, res, next) =>{
    let {error} = listingSchema.validate(req.body);
    if(error) {
     let errMsg = error.details.map((el)=> el.message).join(",");
     throw new ExpressError(400, errMsg);
    } else {
     next();  
}
}


//INDEX ROUTE and create route
router.route("/")
.get( wrapAsync(listingControlleer.index))
.post(
   isLoggedIn,
   
   upload.single("listing[image]"),
   validateListing,
  wrapAsync(listingControlleer.createList)
  );



 //NEW ROUTE
 router.get("/new", isLoggedIn, listingControlleer.renderNewForm );

 //SHOW ROUTE AND UPDATE ROUTE AND DELETE ROUTE
 router
 .route("/:id")

 .get(wrapAsync(listingControlleer.showListing))
 .put(
 isLoggedIn, 
 upload.single("listing[image]"),
 wrapAsync(listingControlleer.updateList))
 .delete(
  isLoggedIn,
   wrapAsync(listingControlleer.deleteList))




//EDIT ROUTE
router.get("/:id/edit", isLoggedIn, wrapAsync(listingControlleer.editList));
router.get("/filter/:id", wrapAsync(listingControlleer.filterList));
router.get("/search/:id", wrapAsync(listingControlleer.filterSearch));

//UPDATE ROUTE

//Delete route

module.exports = router;