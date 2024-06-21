const express = require("express");
const router = express.Router({mergeParams: true});
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/list.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Joi = require('joi');


const {listingSchema, reviewSchema} = require("../schema.js")

//reviews listing
const validateReview = (req, res, next) =>{
     let {error} = reviewSchema.validate(req.body);
     if(error) {
      let errMsg = error.details.map((el)=> el.message).join(",");
      throw new ExpressError(400, errMsg);
     } else {
      next();  
}
};

router.post("/", validateReview,
 wrapAsync(async(req, res)=>{
      let listing = await Listing.findById(req.params.id);
      let newReview = new Review(req.body.review);
      listing.reviews.push(newReview);

     await newReview.save();
     await listing.save();

     console.log("new review saved");
     res.redirect(`/listings/${listing._id}`);
})
);

module.exports = router;