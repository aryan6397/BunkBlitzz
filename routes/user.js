const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const LocalStrategy = require('passport-local').Strategy;
const multer = require('multer');
const path = require('path');
const { isLoggedIn } = require('../middleware');

// Set storage engine
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1MB limit
    fileFilter: (req, file, cb) => {
      checkFileType(file, cb);
    }
}).single('profilePhoto');

// Check file type
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only!');
    }
}

// Configure passport
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", upload, wrapAsync(async (req, res) => {
    try {
        const { username, email, password, bio } = req.body;
        const profilePhoto = req.file ? `/uploads/${req.file.filename}` : '/uploads/default.png'; // Provide a default photo

        const newUser = new User({ email, username, bio, profilePhoto });
        const registeredUser = await User.register(newUser, password);

        // Log new user's information to the console
        console.log("New user registered:");
        console.log(`Username: ${registeredUser.username}`);
        console.log(`Email: ${registeredUser.email}`);
        console.log(`Bio: ${registeredUser.bio}`);
        console.log(`Profile Photo: ${registeredUser.profilePhoto}`);

        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
           

            req.flash("success", "Welcome to Wanderlust!");
            res.redirect("/listings");
        });
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));



router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login", passport.authenticate("local", { 
    failureRedirect: "/login",
    failureFlash: 'Invalid username or password.'
}), (req, res) => {
    req.flash("success", "Welcome back to Wanderlust! You are logged in!");
    res.redirect("/listings");
});

router.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!");
        res.redirect("/listings");
    });
});
// Add the profile route
// Route to get user profile
router.get('/profile/:id', isLoggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/listings');
        }
        res.render('users/profile', { user });
    } catch (err) {
        req.flash('error', 'Something went wrong');
        res.redirect('/listings');
    }
});

// Show user profile
// router.get('/:id', isLoggedIn, async (req, res) => {
//     try {
//         const user = await User.findById(req.params.id);
//         if (!user) {
//             req.flash('error', 'User not found');
//             return res.redirect('/listings');
//         }
//         res.render('users/profile.ejs', { user });
//     } catch (err) {
//         req.flash('error', 'Something went wrong');
//         res.redirect('/listings');
//     }
// });

module.exports = router;
