if(process.env.NODE_ENV!="production"){require('dotenv').config();

}

// console.log(process.env);

const express = require("express");
const app = express();
const port = 3000;

const mongoose = require("mongoose");

const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require("path");
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore=require('connect-mongo');

const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");


const listingsrouter=require("./routes/listing.js");
const reviewsrouter =require("./routes/review.js");
const userrouter=require("./routes/user.js");

// ================== MongoDB ==================

const dbUrl=process.env.ATLASDB_URL;


async function main() {
  await mongoose.connect(dbUrl );
}

main()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("MongoDB Error:", err));

// ================== App Config ==================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));


// ================== Home ==================
// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });
const store=MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter:24*3600,
});

store.on("error",()=>{
  console.log("Error in mongo session store",err);
});
//===sessions options
const sessionOptions={
  store,
  secret:process.env.SECRET,
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires:Date.now()+7*24*60*60*1000,
    maxAge:7*24*60*60*1000,
    httpOnly:true,
  },
};



app.use(session(sessionOptions));

//==flash==
app.use(flash());


// Passport require
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
});

// //demo for passport 
// app.get("/demouser",async(req,res)=>{
//   let fakeUser=new User({
//     email:"Student1@gmail.com",
//     username:"delta-student",
//   });
//   let newUser=await User.register(fakeUser,"helloworld");
//   res.send(newUser);
// });




// listind routes
app.use("/listings",listingsrouter);
//reviews routes
app.use("/listings/:id/reviews",reviewsrouter);
//user router
app.use("/",userrouter);


// ================== ERROR HANDLING ==================
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found!"));
});



app.use((err, req, res, next) => {
  let {statusCode=500,message="Somthing Wents Wrong"}=err;
  res.render("error.ejs",{message});
  // res.status(statusCode).send(message);
});

// ================== Server ==================
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
