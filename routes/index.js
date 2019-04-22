var express=require("express");
var router=express.Router();
var passport=require("passport");
var User=require("../models/user");
var middleware=require("../middleware");

router.get("/",function(req,res){
  res.render("landing");
});



//-----------------------COMMENT ROUTES-------------------------



//AUTH ROUTES
//SHOW REGISTER form
router.get("/register", function(req, res){
    console.log("get req.body="+req.body);
  res.render("register");
});

//sign up logic
router.post("/register", function(req, res){
  var newUser=new User({username:req.body.username});
  User.register(newUser,req.body.password,function(err,user){
    if(err){
      return res.render("register");
    }
    passport.authenticate("local")(req,res,function(){
      req.flash("success","Here you are, "+user.username);
      res.redirect("/campgrounds");
    });
  });
});

//show login form
router.get("/login",function(req,res){
  res.render("login");
});

router.post("/login",
  passport.authenticate("local",{
    successRedirect:"/campgrounds",
    failureRedirect:"/login"
  }),
  function(req,res){
      console.log("login post req.body="+req.body);
});

//logic ROUTES
router.get("/logout",function(req,res){
  req.logout();
  res.redirect("/campgrounds");
});


module.exports=router;
