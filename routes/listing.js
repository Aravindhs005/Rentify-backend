const router = require("express").Router();
const multer = require("multer");

const Listing = require("../models/Listing");
const User = require("../models/User")

/* Configuration Multer for File Upload */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/"); // Store uploaded files in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage });



/* CREATE LISTING */
router.post("/create", upload.array("listingPhotos"), async (req, res) => {
  try {
    /* Take the information from the form */
    const {
      creator,
      category,
      streetAddress,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      title,
      description,
      highlight,
      highlightDesc,
      price,
    } = req.body;

    const listingPhotos = req.files

    if (!listingPhotos) {
      return res.status(400).send("No file uploaded.")
    }

    const listingPhotoPaths = listingPhotos.map((file) => file.path)

    const newListing = new Listing({
      creator,
      category,
      streetAddress,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      listingPhotoPaths,
      title,
      description,
      highlight,
      highlightDesc,
      price,
    })

    await newListing.save()

    res.status(200).json(newListing)
  } catch (err) {
    res.status(409).json({ message: "Fail to create Listing", error: err.message })
    console.log(err)
  }
});

/* UPDATE LISTING */
router.put("/:listingId/edit", upload.array("listingPhotos"), async (req, res) => {
  try {
    const { listingId } = req.params;

    // Find the listing by ID
    const existingListing = await Listing.findById(listingId);

    // Check if the listing exists
    if (!existingListing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    /* Take the information from the form */
    const {
      category,
      streetAddress,
      city,
      province,
      country,
      guestCount,
      bedroomCount,
      bedCount,
      bathroomCount,
      amenities,
      title,
      description,
      highlight,
      highlightDesc,
      price,
    } = req.body;

    const listingPhotos = req.files;

    // Update listing fields
    existingListing.category = category;
    existingListing.streetAddress = streetAddress;
    existingListing.city = city;
    existingListing.province = province;
    existingListing.country = country;
    existingListing.guestCount = guestCount;
    existingListing.bedroomCount = bedroomCount;
    existingListing.bedCount = bedCount;
    existingListing.bathroomCount = bathroomCount;
    existingListing.amenities = amenities;
    existingListing.title = title;
    existingListing.description = description;
    existingListing.highlight = highlight;
    existingListing.highlightDesc = highlightDesc;
    existingListing.price = price;

    // Update listing photos if provided
    if (listingPhotos && listingPhotos.length > 0) {
      const listingPhotoPaths = listingPhotos.map((file) => file.path);
      existingListing.listingPhotoPaths = listingPhotoPaths;
    }

    // Save the updated listing
    await existingListing.save();

    res.status(200).json(existingListing);
  } catch (err) {
    res.status(500).json({ message: "Failed to update listing", error: err.message });
  }
});


/* GET lISTINGS BY CATEGORY */
router.get("/", async (req, res) => {
  const qCategory = req.query.category

  try {
    let listings
    if (qCategory) {
      listings = await Listing.find({ category: qCategory }).populate("creator")
    } else {
      listings = await Listing.find().populate("creator")
    }

    res.status(200).json(listings)
  } catch (err) {
    res.status(404).json({ message: "Fail to fetch listings", error: err.message })
    console.log(err)
  }
})



/* GET LISTINGS BY SEARCH */
router.get("/search/:search", async (req, res) => {
  const { search } = req.params

  try {
    let listings = []

    if (search === "all") {
      listings = await Listing.find().populate("creator")
    } else {
      listings = await Listing.find({
        $or: [
          { category: {$regex: search, $options: "i" } },
          { title: {$regex: search, $options: "i" } },
          { city: {$regex: search, $options: "i" } },
          { province: {$regex: search, $options: "i" } },
          { country: {$regex: search, $options: "i" } },

        ]
      }).populate("creator")
    }

    res.status(200).json(listings)
  } catch (err) {
    res.status(404).json({ message: "Fail to fetch listings", error: err.message })
    console.log(err)
  }
})

/* LISTING DETAILS */
router.get("/:listingId", async (req, res) => {
  try {
    const { listingId } = req.params
    const listing = await Listing.findById(listingId).populate("creator")
    res.status(202).json(listing)
  } catch (err) {
    res.status(404).json({ message: "Listing can not found!", error: err.message })
  }
})

router.delete('/:listingId/delete', async (req, res) => {
  const { listingId } = req.params;

  try {
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    await listing.deleteOne(); // Use the deleteOne() method of the Mongoose model

    res.status(200).json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router
