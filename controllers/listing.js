const Listing = require("../models/list")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { all } = require("../routes/listing");
const mapToken = "pk.eyJ1IjoiYW1ydXRhMzAxIiwiYSI6ImNscml2aTNnMTBkbDUya28xMnVjaDI1MHUifQ.60Vrb0mE47aPmwOd2_RyOg";
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index=async (req, res)=>{
    const allListing = await Listing.find({});
    res.render("listing/index.ejs", {allListing});
 }

module.exports.renderNewForm =  (req, res)=>{
    // if(!req.isAuthenticated()){
    //     req.flash("error", "You must be logged in to create listing");
    //     return res.redirect("/listings");
    // } hmne isse ak middleware isLoggedIn m convert karr diya hai
     res.render("listing/new.ejs");
 }

 module.exports.showListing = async (req, res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    console.log(listing);
    res.render("listing/show.ejs", {listing});
}

module.exports.createList = async(req, res, next)=>{

   
      
    let url = req.file.path;
    let filename = req.file.filename;
    if(!req.body.listing){
        throw new ExpressError(400, "Send valid data for listing");
    }
    const newListing = new Listing(req.body.listing);
    newListing.image = {url, filename};
    if(!newListing.title){
        throw new ExpressError(400, "Title is missing!");
    }

    if(!newListing.description){
        throw new ExpressError(400, "Description is missing!");
    }

    
    if(!newListing.country){
        throw new ExpressError(400, "Country is missing!");
    }

    
    if(!newListing.price){
        throw new ExpressError(400, "Price is missing!");
    }
    await newListing.save();
    req.flash("success", "New listing added");
    res.redirect("/listings");


}

module.exports.editList =  async (req, res)=>{
    let {id} = req.params;
     const listing = await Listing.findById(id);
     if (!listing){
        req.flash("error", "Listing you are requested for does not exist");
        res.redirect("/listings");
     }

     //edit form m image ke pixels kam krke show krane k liye
     let originalImageUrl = listing.image.url;
     originalImageUrl=originalImageUrl.replace("/upload", "/upload/ar_1.0,c_fill,w_250/r_max/f_auto")
     res.render("listing/edit.ejs" , {listing,  originalImageUrl});
}

module.exports.updateList = async (req, res) => {
    try {
        let { id } = req.params;
        let updateListing = req.body.listing;
        
        // Assuming Listing is your Mongoose model
       let listing = await Listing.findByIdAndUpdate(id, updateListing);
       if (typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url, filename};
        await listing.save();
       }
      
        // Use correct syntax for template literal
        res.redirect(`${id}`);
    } catch (error) {
        // Handle errors appropriately, e.g., send an error response
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};



  


module.exports.deleteList = async(req,res)=>{
    let {id} = req.params;
    let deleteListing =await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    console.log("delete")
    req.flash("success", "Listing deleted");
    res.redirect("/listings");
}

module.exports.filterList = async (req, res, next) => {
    try {
      let { id } = req.params;
      
  
      let allListing = await Listing.find({ category: { $all: [id]} });
      
  
      // Initialize req.locals if it's undefined
      req.locals = req.locals || {};
  
      if (allListing.length !== 0) {
        req.locals.success = `Listings found by ${id}`;
        res.render('listing/index.ejs', { allListing });
      } else {
        req.flash('error', 'Listings not found!');
        res.redirect('/listings');
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  module.exports.filterSearch = async (req, res, next) => {
    try {
      let { id } = req.params;
      
  
      let allListing = await Listing.find({ country: { $all: [id]} });
      
  
      // Initialize req.locals if it's undefined
      req.locals = req.locals || {};
  
      if (allListing.length !== 0) {
        req.locals.success = `Listings found by ${id}`;
        res.render('listing/index.ejs', { allListing });
      } else {
        req.flash('error', 'Listings not found!');
        res.redirect('/listings');
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  