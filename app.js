const express = require("express");
const app = express();
const session= require("express-session");
const MongoStore= require("connect-mongo").default;
const flash= require("connect-flash");

if(process.env.NODE_ENV !="production"){
require('dotenv').config()
}


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const path = require("path")
const mongoose = require('mongoose');

const listingRouter = require("./Routes/listing.js");
const reviewRouter = require("./Routes/review.js");
const userRouter = require("./Routes/user.js");

const passport= require("passport");
const LocalStrategy= require("passport-local");
const User= require("./models/user.js");


const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");


const ExpressError = require("./upi/utils/ExpressError.js")


app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs");

app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const dbUrl= process.env.ATLASDB_URL;


main()
    .then(() => {
        console.log("connection successful")
    })
    .catch(err => console.log(err));


async function main() {
    // await mongoose.connect('mongodb://127.0.0.1:27017/wanderlust');
    await mongoose.connect(dbUrl)

}

const store= new MongoStore({
    mongoUrl:dbUrl,
    crypto:{
         secret:process.env.SECRET
    },
    touchAfter: 24*3600
});
store.on("error",(err)=>{
    console.log("error in session store",err)
})

const sessionOptions= {
    store,
    secret:process.env.SECR,
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
    },
}


 app.use(session(sessionOptions))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>{
    res.locals.success= req.flash("success")
     res.locals.error= req.flash("error")
     res.locals.currUser=req.user
    next();
})

// app.get("/demouser", async(req,res)=>{
//     let fakeuser=  new User({
//         email:"vt95154@gmail.com",
//         username:"Sigma-Student",
//     })

// let registeredUser=await User.register(fakeuser, "helloWorld")
// res.send(registeredUser)
// });




app.use("/listings", listingRouter)
app.use("/listings/:id/reviews", reviewRouter)
app.use("/", userRouter)




app.all("/{*splat}", (req, res, next) => {
    next(new ExpressError(404, "Page not Found"))
});

app.use((err, req, res, next) => {
    let { statuscode = 500, message = "Something went wrong" } = err
    res.status(statuscode).render("error.ejs", { message })
});

app.listen(8080, () => {
    console.log("app is listening port:8080");
})











