const  express = require("express");
const app = express();
const users = require("./routes/user.js");
const posts = require("./routes/post.js");
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");

app.set("view engine", 'ejs');
app.set("views", path.join(__dirname, "views"));

//phase 2 part c

const sessionOption = {
    secret: "mysupersecretstring",
    resave: false,
    saveUninitialized: true,
};

app.use(session(sessionOption));
app.use(flash());

app.get("/register", (req, res)=>{
    let {name = "Anonymous"} = req.query;
    req.session.name=name;
    req.flash("success", "users register successfully");
    res.redirect("/hello");
})

app.get("/hello", (req, res)=>{
   // console.log(req.flash("success"));
    res.locals.messages = req.flash("success");
    res.render("page.ejs", { name: req.session.name,});
    //res.send(`hello, ${req.session.name}`);
})

app.get("/reqcount", (req, res)=>{
    if(req.session.count){
        req.session.count++;
    }else{
        req.session.count=1;
    }

    res.send(`You sent a request ${req.session.count} times`);
})
// const cookieParser = require("cookie-parser");

// app.use(cookieParser());

// app.get("/getsignedcookie", (req, res)=>{
//      res.cookie("made-In", "India", { signed: true });
//      res.send("cookie send");
// })

// app.get("/verify", (req, res)=>{
//     console.log(req.signedCookies);
//     res.send("verified");
// })


// app.get("/getcookies", (req, res)=>{
//     res.cookie("greet", "hello");
//     res.send("send some cookies");
// })

// app.get("/", (req, res)=>{
//     console.dir(req.cookies);
//     res.send("Hi i am a root");

// });


app.use("/users", users);
app.use("/posts", posts);

app.listen(3000, () =>{
    console.log("server is listening to 3000");
})