var express=require("express");
var app=express();
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var methodOverride=require("method-override");
var Campground=require("./models/campground");
var Comment=require("./models/comment");
var passport=require("passport");
var LocalStrategy=require("passport-local");
var User=require("./models/user");
var seedDB=require("./seeds");
var commentRoutes=require("./routes/comments");
var campgroundRoutes=require("./routes/campgrounds");
var indexRoutes=require("./routes/index");
var reviewRoutes=require("./routes/reviews");
var flash=require("connect-flash");

mongoose.connect("mongodb+srv://Lizzy:1985317me@cluster0-aoquo.mongodb.net/test?retryWrites=true",{ useNewUrlParser: true });
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(express.static(__dirname +"/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();

app.use(require("express-session")({
  secret:"Rusty wins",
  resave:false,
  saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next){
  res.locals.currentUser=req.user;
  res.locals.error=req.flash("error");
  res.locals.success=req.flash("success");
  next();
});

app.use("/",indexRoutes);
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);
app.use("/campgrounds/:id/reviews",reviewRoutes);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.listen(2222,function(){
  console.log("YelpCamp has started!");
});
