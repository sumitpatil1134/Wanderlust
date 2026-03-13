const Listing=require("../models/listing.js");

//index route
module.exports.index=async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  }

  //new route
  module.exports.renderNewForm=(req, res) => {
  res.render("listings/new.ejs");
};

//show listing route
module.exports.showListing=async (req, res) => {
    const { id } = req.params;

    const listing = await Listing.findById(id).populate("owner").populate({ path:"reviews",populate:{path:"author",},});

    if (!listing) {
      req.flash("error", "Listing you requested does not exist");
      return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show", { listing });
  };

  //creat  or post route
  module.exports.createListing= async (req, res, next) => {
     let url=req.file.path;
     let filename=req.file.filename;
      const newListing = new Listing(req.body.listing);
      newListing.owner=req.user._id;
      newListing.image={url,filename};
      await newListing.save();
      req.flash("success","New Listing Created!");
  
      res.redirect("/listings");
    };

    // edit   route form

    module.exports.renderEditForm=async (req, res) => {
        const { id } = req.params;
    
        const listing = await Listing.findById(id);
    
           if (!listing) {
          req.flash("error","Listing you requested for does not exists:");
          res.redirect("/listings");
        }
        let originalImageUrl=listing.image.url;
        originalImageUrl=originalImageUrl.replace("/upload","/upload/w_250");
        req.flash("success","Listing Updated");
        res.render("listings/edit.ejs", { listing,originalImageUrl });
      };

      //update route
      module.exports.upadteListing=async (req, res) => {
    const { id } = req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});

    if(typeof req.file !=="undefined"){
    let url=req.file.path;
     let filename=req.file.filename;
     listing.image={url,filename};
     await listing.save();
    }
    req.flash("success","Listing Updated");
    res.redirect(`/listings/${id}`);
  };


  //delete route
  module.exports.deleteListing=async (req, res) => {
    const { id } = req.params;

    await Listing.findByIdAndDelete(id);

    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
  };


