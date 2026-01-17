const Listing = require("../models/listing.js");

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
 const mapToken=process.env.MAP_TOKEN
const geocodingClint= mbxGeocoding({accessToken:mapToken})
const { cloudinary } = require("../cloudConfig.js");

module.exports.index=async (req, res) => {
    let allListings = await Listing.find({})
    res.render("listings/index.ejs", { allListings });
}

//NEW FORM :
module.exports.renderNewForm=(req, res) => {
    res.render("listings/new.ejs");
}

//LISTING SHOW KARNE KE LIYE:
module.exports.showListing=(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate({
        path: "reviews",
        populate: { path: "author" }
    }).populate("owner");
    if (!listing) {
        req.flash("error", "Listing you are try to reach does not exist ")
        return res.redirect("/listings")
    };
    res.render("listings/show.ejs", { listing })

})

//CREATE LISTING
module.exports.createListing= (async (req, res,next) => {
    let response= await geocodingClint
    .forwardGeocode({
        query:req.body.listing.location,
        limit:1
    })
    .send();
    
    
    let url= req.file.path
    let filename= req.file.filename;
    const newListing = new Listing(req.body.listing)
    newListing.owner = req.user._id;
    newListing.image={url,filename}

    newListing.geometry=response.body.features[0].geometry
    
    await newListing.save();
 
    req.flash("success", "New listing  Created")
    res.redirect("/listings")

})

//LISTING KO EDIT KARNE KE LIYE:
module.exports.renderEditForm=(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
  let originalimageUrl;
  if (listing.image && listing.image.url) {
    originalimageUrl = listing.image.url.replace("/upload", "/upload/w_300");
  }
    res.render("listings/edit.ejs", { listing, originalimageUrl })
})

//LISTING KO EDIT KARNE KE LIYE:
module.exports.updateListing= async (req, res,) => {
    let { id } = req.params;
  let listing=  await Listing.findByIdAndUpdate(id, { ...req.body.listing },{new:true});
   
// 2. Agar location change hui hai to naya geocode
    if (req.body.listing.location) {
      const geoRes = await geocodingClint
        .forwardGeocode({
          query: req.body.listing.location,
          limit: 1
        })
        .send();

      listing.geometry = geoRes.body.features[0].geometry; // nayi coordinates save
    }

   if (typeof req.file !=="undefined"){
    let url= req.file.path;
    let filename= req.file.filename;
    listing.image= {url, filename};
   }
   await listing.save();
    req.flash("success", " listing  Updated")
    res.redirect(`/listings/${id}`);
    
}


//DELETE LISTING:
module.exports.destoryListing= async (req, res) => {
    let { id } = req.params;
    // fetch listing first so we can remove its image from Cloudinary
    let listing = await Listing.findById(id);

    if (listing && listing.image && listing.image.filename) {
        await cloudinary.uploader.destroy(listing.image.filename);
    }
    let deletedlisting = await Listing.findByIdAndDelete(id);
    req.flash("success", " listing  deleted")
    console.log(deletedlisting);
    res.redirect("/listings")
}