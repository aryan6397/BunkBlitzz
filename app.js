if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/list.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
app.use(express.static(path.join(__dirname,"/public/")))
const Joi = require('joi');
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const {listingSchema, reviewSchema} = require("./schema.js")

const Review = require("./models/review.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter= require("./routes/review.js");
const userRouter = require("./routes/user.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main().then(()=>{
    console.log("connected to DB");
}).catch((err)=>{
    console.log(err);
})

async function main() {
    await mongoose.connect(MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

}

app.set("view engine", 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

const sessionOptions = {
    secret: "mysupersecretcode",
    resave: false,
    saveUnintialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

// app.get("/", (req, res)=>{
//     res.send("Hi i am root");
// })

app.use(session(sessionOptions));
app.use(flash());

//Authentication
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
})
//for checking authentication 
// app.get("/demouser", async (req, res)=>{
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "web-student"
//     })

//    let registerUser = await User.register(fakeUser, "helloworld");
//    res.send(registerUser);
// })


// const validateListing = (req, res, next) =>{
//     let {error} = listingSchema.validate(req.body);
//     if(error) {
//      let errMsg = error.details.map((el)=> el.message).join(",");
//      throw new ExpressError(400, errMsg);
//     } else {
//      next();  
// }
// }


// const validateReview = (req, res, next) =>{
//        let {error} = reviewSchema.validate(req.body);
//        if(error) {
//         let errMsg = error.details.map((el)=> el.message).join(",");
//         throw new ExpressError(400, errMsg);
//        } else {
//         next();  
//  }
// };

//foe use routes listing.js
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// //INDEX ROUTE

// app.get("/listings", wrapAsync( async (req, res)=>{
//    const allListing = await Listing.find({});
//    res.render("listing/index.ejs", {allListing});
// })
// );
// //NEW ROUTE
// app.get("/listings/new", (req, res)=>{
//     res.render("listing/new.ejs");
// })

// //SHOW ROUTE
// app.get("/listings/:id", wrapAsync( async (req, res)=>{
//     let {id} = req.params;
//     const listing = await Listing.findById(id).populate("reviews");
//     res.render("listing/show.ejs", {listing});
// })
// );

// //CREATE ROUTE
// app.post("/listings",
// validateListing,
// wrapAsync(async(req, res, next)=>{
//         if(!req.body.listing){
//             throw new ExpressError(400, "Send valid data for listing");
//         }
//         const newListing = new Listing(req.body.listing);
//         if(!newListing.title){
//             throw new ExpressError(400, "Title is missing!");
//         }

//         if(!newListing.description){
//             throw new ExpressError(400, "Description is missing!");
//         }

        
//         if(!newListing.country){
//             throw new ExpressError(400, "Country is missing!");
//         }

        
//         if(!newListing.price){
//             throw new ExpressError(400, "Price is missing!");
//         }
//         await newListing.save();
//         res.redirect("/listings");
    
  
// })
// );



// //EDIT ROUTE
// app.get("/listings/:id/edit", wrapAsync( async (req, res)=>{
//     let {id} = req.params;
//      const listing = await Listing.findById(id);
//      res.render("listing/edit.ejs" , {listing});
// })
// );

// //UPDATE ROUTE
// app.put("/listings/:id", wrapAsync(async (req, res)=>{
//     let {id} = req.params;
//     let updateListing = req.body.listing;
//     await Listing.findByIdAndUpdate(id, updateListing);
//     res.redirect("listings/${id}");
// })
// );


// //Delete route
// app.delete("/listings/:id", wrapAsync(async(req,res)=>{
//     let {id} = req.params;
//     let deleteListing =await Listing.findByIdAndDelete(id);
//     console.log(deleteListing);
//     console.log("delete")
//     res.redirect("/listings");
// })
// );


app.post("/listings", wrapAsync(async(req, res)=>{
    try {
        let newListing = new Listing(req.body.listing);
        
        await newListing.save();
        res.redirect("/listings");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})
);

// //reviews listing
// app.post("/listings/:id/reviews", validateReview,
//  wrapAsync(async(req, res)=>{
//       let listing = await Listing.findById(req.params.id);
//       let newReview = new Review(req.body.review);
//       listing.reviews.push(newReview);

//      await newReview.save();
//      await listing.save();

//      console.log("new review saved");
//      res.redirect(`/listings/${listing._id}`);
// })
// );

//jab simple error show krna ho
// app.use((err, req, res, next) =>{
//     res.send("Something went wrong!");
// })

app.all("*", (req, res, next)=>{
    next(new ExpressError(404, "Page not found"))
});

//jab according to error message show krana ho

app.use((err, req, res, next)=>{
    let {statusCode=500, message="Something went wrong"} = err;
    res.status(statusCode).render("error.ejs",{message});
    //res.status(statusCode).send(message);
})


// app.get("/testList", async (req, res)=>{
//      let sampleListing = new Listing({
//         title: "My new villa",
//         description: "By the beach in night trees",
//         price: "1200",
//         location: "Calcangute, Goa",
//         country: "India", 
//      });

//      await sampleListing.save();
//      console.log("Sample was saved");
//      res.send("Successfull testing");
// })

app.listen(8080, () =>{
    console.log("server is listening to port 8080");

})