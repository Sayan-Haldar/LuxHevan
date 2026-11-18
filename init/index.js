const path = require("path");
if (process.env.NODE_ENV != "production") {
	require("dotenv").config({ path: path.join(__dirname, "../.env") });
}
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const DB_URL = process.env.ATLASDB_URL;

// Curated relatable categories for each of the 29 sample listings
const curatedCategories = {
	"Cozy Beachfront Cottage": ["Beachfront", "Luxe", "Iconic Cities"],
	"Modern Loft in Downtown": ["Iconic Cities", "Rooms", "Luxe"],
	"Mountain Retreat": ["Mountains", "Cabins", "Countryside"],
	"Historic Villa in Tuscany": ["Villas", "Historic", "Countryside", "Luxe"],
	"Secluded Treehouse Getaway": ["Treehouses", "Countryside", "Cabins"],
	"Beachfront Paradise": ["Beachfront", "Tropical", "Amazing Pools", "Villas"],
	"Rustic Cabin by the Lake": ["Lakefront", "Cabins", "Mountains"],
	"Luxury Penthouse with City Views": ["Iconic Cities", "Luxe", "Rooms"],
	"Ski-In/Ski-Out Chalet": ["Mountains", "Cabins", "Luxe"],
	"Safari Lodge in the Serengeti": ["National Parks", "Luxe", "Countryside"],
	"Historic Canal House": ["Historic", "Iconic Cities", "Rooms"],
	"Private Island Retreat": ["Tropical", "Beachfront", "Luxe", "Villas"],
	"Charming Cottage in the Cotswolds": ["Countryside", "Historic", "Cabins"],
	"Historic Brownstone in Boston": ["Historic", "Iconic Cities", "Rooms"],
	"Beachfront Bungalow in Bali": ["Beachfront", "Tropical", "Villas"],
	"Mountain View Cabin in Banff": ["Mountains", "Cabins", "National Parks"],
	"Art Deco Apartment in Miami": ["Iconic Cities", "Beachfront", "Luxe"],
	"Tropical Villa in Phuket": ["Tropical", "Villas", "Amazing Pools", "Luxe"],
	"Historic Castle in Scotland": ["Historic", "Countryside", "Luxe"],
	"Desert Oasis in Dubai": ["Iconic Cities", "Luxe", "Amazing Pools", "Villas"],
	"Rustic Log Cabin in Montana": ["Cabins", "Mountains", "National Parks"],
	"Beachfront Villa in Greece": ["Beachfront", "Villas", "Amazing Pools", "Luxe"],
	"Eco-Friendly Treehouse Retreat": ["Treehouses", "Tropical", "National Parks"],
	"Historic Cottage in Charleston": ["Historic", "Countryside", "Rooms"],
	"Modern Apartment in Tokyo": ["Iconic Cities", "Rooms", "Luxe"],
	"Lakefront Cabin in New Hampshire": ["Lakefront", "Cabins", "Countryside"],
	"Luxury Villa in the Maldives": ["Beachfront", "Villas", "Amazing Pools", "Tropical", "Luxe"],
	"Ski Chalet in Aspen": ["Mountains", "Cabins", "Luxe"],
	"Secluded Beach House in Costa Rica": ["Beachfront", "Tropical", "Villas"],
};

const initDB = async () => {
	try {
		await mongoose.connect(DB_URL);
		console.log("Connected to MongoDB for initialization.");

		let defaultUser = await User.findOne();
		if (!defaultUser) {
			console.log("No user found in database. Creating default user...");
			defaultUser = await User.register(
				new User({
					email: "sayanhaldar0010@gmail.com",
					username: "sayanhaldar0010",
					fName: "Sayan",
					lName: "Haldar",
				}),
				"Admin@123"
			);
		}
		console.log("Using owner ID:", defaultUser._id);

		await Listing.deleteMany({});
		const listingsToInsert = initData.data.map((obj) => {
			const categories = curatedCategories[obj.title] || ["Luxe", "Villas"];
			return {
				...obj,
				owner: defaultUser._id,
				price: obj.price * 25,
				category: categories,
			};
		});

		await Listing.insertMany(listingsToInsert);
		console.log(`Successfully seeded ${listingsToInsert.length} listings with curated relatable categories!`);
	} catch (err) {
		console.error("Error initializing DB:", err);
	} finally {
		await mongoose.disconnect();
		console.log("Disconnected from MongoDB.");
	}
};

initDB();
