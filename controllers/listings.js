const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;

function geocodingClient() {
	return mbxGeocoding({ accessToken: mapToken });
}

module.exports.index = async (req, res, next) => {
	let allListing = await Listing.find().sort({ _id: -1 });
	res.render("listings/index.ejs", { allListing });
};

module.exports.renderNewForm = (req, res) => {
	res.render("listings/new.ejs");
};

module.exports.createListing = async (req, res, next) => {
	let response = await geocodingClient()
		.forwardGeocode({
			query: `${req.body.listing.location},${req.body.listing.country}`,
			limit: 1,
		})
		.send();
	let url = req.file.path;
	let filename = req.file.filename;
	const newListing = new Listing(req.body.listing);
	newListing.owner = req.user._id;
	newListing.image = { url, filename };
	newListing.geometry = response.body.features[0].geometry;
	await newListing.save();
	req.flash("success", "New Listing Created!");
	res.redirect("/listings");
};

module.exports.showListing = async (req, res, next) => {
	let { id } = req.params;
	let listing = await Listing.findById(id)
		.populate({ path: "reviews", populate: { path: "author" } })
		.populate("owner");

	if (!listing) {
		req.flash("error", "Listing you requested for does not exist!");
		return res.redirect("/listings");
	}
	console.log(listing);
	res.render("listings/show.ejs", { listing });
};

module.exports.renderEditForm = async (req, res, next) => {
	let { id } = req.params;
	let listing = await Listing.findById(id);
	if (!listing) {
		req.flash("error", "Listing you requested for does not exist!");
		return res.redirect("/listings");
	}
	let originalImage = listing.image ? listing.image.url : "";
	if (originalImage) {
		originalImage = originalImage.replace("/upload", "/upload/w_200,h_150");
	}
	res.render("listings/edit.ejs", { listing, originalImage });
};

module.exports.updateListing = async (req, res, next) => {
	let { id } = req.params;
	let response = await geocodingClient()
		.forwardGeocode({
			query: `${req.body.listing.location},${req.body.listing.country}`,
			limit: 1,
		})
		.send();
	let updateListing = req.body.listing;
	let listing = await Listing.findByIdAndUpdate(id, updateListing);

	listing.geometry = response.body.features[0].geometry;
	await listing.save();

	if (typeof req.file != "undefined") {
		let url = req.file.path;
		let filename = req.file.filename;
		listing.image = { url, filename };
		await listing.save();
	}
	req.flash("success", "Listing Updated!");
	res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res, next) => {
	let { id } = req.params;
	let deleteListing = await Listing.findByIdAndDelete(id);
	console.log(deleteListing);
	req.flash("error", "Listing Deleted!");
	console.log("delete");
	res.redirect("/listings");
};

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports.filter = async (req, res, next) => {
	let { id } = req.params;
	let escapedCategory = escapeRegex(id.trim());
	let allListing = await Listing.find({
		category: { $regex: new RegExp(`^${escapedCategory}$`, "i") },
	}).sort({ _id: -1 });

	if (allListing.length !== 0) {
		res.locals.success = `Showing ${allListing.length} stay${allListing.length > 1 ? "s" : ""} in "${id}"`;
	}
	res.render("listings/index.ejs", { allListing, filterCategory: id });
};

module.exports.filterbtn = (req, res, next) => {
	res.redirect("/listings");
};

module.exports.search = async (req, res) => {
	let q = (req.query.q || "").trim();
	let minPrice = req.query.minPrice ? Number(req.query.minPrice) : null;
	let maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : null;
	let category = (req.query.category || "").trim();

	let conditions = [];

	if (q) {
		let cleanQ = q.replace(/\s+/g, " ");
		let num = Number(cleanQ);
		if (!isNaN(num) && num > 0) {
			conditions.push({ price: { $lte: num } });
		} else {
			let terms = cleanQ.split(" ").filter((t) => t.length > 0);
			for (let term of terms) {
				let termRegex = new RegExp(escapeRegex(term), "i");
				conditions.push({
					$or: [
						{ title: termRegex },
						{ description: termRegex },
						{ location: termRegex },
						{ country: termRegex },
						{ category: termRegex },
					],
				});
			}
		}
	}

	if (minPrice !== null && !isNaN(minPrice) && minPrice > 0) {
		conditions.push({ price: { $gte: minPrice } });
	}
	if (maxPrice !== null && !isNaN(maxPrice) && maxPrice > 0) {
		conditions.push({ price: { $lte: maxPrice } });
	}
	if (category && category !== "All" && category !== "all") {
		conditions.push({
			category: { $regex: new RegExp(`^${escapeRegex(category)}$`, "i") },
		});
	}

	let mongoQuery = conditions.length > 0 ? { $and: conditions } : {};
	let allListing = await Listing.find(mongoQuery).sort({ _id: -1 });

	if (allListing.length > 0) {
		res.locals.success = `Found ${allListing.length} stay${allListing.length > 1 ? "s" : ""} matching your search`;
	}

	res.render("listings/index.ejs", {
		allListing,
		searchQuery: q,
		filterCategory: category,
		minPrice,
		maxPrice,
	});
};
