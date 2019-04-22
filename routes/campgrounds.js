var express=require("express");
var router=express.Router({mergeParams:true});
var Campground=require("../models/campground");
var Comment=require("../models/comment");
var Review = require("../models/review");
var mongoose=require("mongoose");
var middleware=require("../middleware/index.js");

router.get("/",function(req,res){
  //res.render("campgrounds", {campgrounds:campgrounds});
  Campground.find({},function(err,allCampgrounds){
    if(err){
      console.log(err);
    }else{
      res.render("campgrounds/index", {
        campgrounds:allCampgrounds
      });
    }
  })
});

router.post("/",middleware.isLoggedIn,function(req,res){
  //get data from form and add to campground array, redirect back
  var name=req.body.name;
  var image=req.body.image;
  var desc=req.body.description;
  var newCampground={
    name:name,
    image:image,
    description:desc,
    author:{
      id:res.locals.currentUser,
      username:res.locals.currentUser.username
    }
  };
  //create a new campground and save to db
  Campground.create(newCampground,function(err,newlyCampground){
    if(err){
      console.log(err);
    }else{
        res.redirect("/campgrounds");
    }
  });
});

//NEW - show the form to create a new one
router.get("/new",middleware.isLoggedIn,function(req,res){
  res.render("campgrounds/new");
});

//Shows the info
router.get("/:id",function(req,res){
  //find the provided id and render to show
  Campground.findById(req.params.id)
  .populate("comments")
  .populate({
    path:"reviews",
    options:{
      sort:{
        createdAt:-1
      }
    }
  })
  .exec(function(err,foundCampground){
      if(err){
        console.log(err);
      }else{
        var isCampgroundAuthor=false;
        if(res.locals.currentUser
          &&foundCampground.author.id.equals(res.locals.currentUser._id)){
            isCampgroundAuthor=true;
        }
        res.render("campgrounds/show",{
          campground:foundCampground,
          isCampgroundAuthor:isCampgroundAuthor
        });
        isCampgroundAuthor=false;
      }
  });

});

//rEDIT Campground Route
router.get("/:id/edit",middleware.checkCampgroundOwnership,function(req,res){
//if user isn't logged in, redirect
//else authorization
  Campground.findById(req.params.id, function(err,foundCampground){
    res.render("campgrounds/edit",{campground:foundCampground});
  });
});

//UPDATE Campground Route
router.put("/:id/",middleware.checkCampgroundOwnership,function(req,res){
  //find and update the campground
  delete req.body.campground.rating;
  console.log(req.params.id);
  Campground.findByIdAndUpdate(req.params.id,req.body.campground,function(err,updatedCampground){
    if(err){
      res.redirect("/campgrounds");
    }else{
      console.log("updated campground:"+updatedCampground);
      res.redirect("/campgrounds/"+req.params.id);
    }
  });
});

//DESTROY CAMPGROUND Route
router.delete("/:id/",middleware.checkCampgroundOwnership,function(req,res){
  Campground.findByIdAndRemove(req.params.id,function(err,campground){
      if(err){
        res.redirect("/campgrounds");
    }else{
          // deletes all reviews associated with the campground
          Review.remove({"_id": {$in: campground.reviews}}, function (err) {
              if (err) {
                  return res.redirect("/campgrounds");
              }
              //  delete the campground
              campground.remove();
              req.flash("success", "You threw away a member berry!");
              res.redirect("/campgrounds");
          });
      }
    }
  );
});

module.exports=router;
