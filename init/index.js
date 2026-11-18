const path = require("path");
if (process.env.NODE_ENV != "production") {
	require("dotenv").config({ path: path.join(__dirname, "../.env") });
}
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");

const DB_URL = process.env.ATLASDB_URL;

let categoryAll = [
	"Beachfront",
	"Cabins",
	"Omg",
	"Lake",
	"Design",
	"Amazing Pools",
	"Farms",
	"Amazing Views",
	"Rooms",
	"Lakefront",
	"Tiny Homes",
	"Countryside",
	"Treehouse",
	"Trending",
	"Tropical",
	"National Parks",
	"Castles",
	"Camping",
	"Top Of The World",
	"Luxe",
	"Iconic Cities",
	"Earth Homes",
];

const initDB = async () => {
	try {
		await mongoose.connect(DB_URL);
		console.log("Connected to MongoDB for initialization.");

		// Find an existing user to assign as owner
		let defaultUser = await User.findOne();
		if (!defaultUser) {
			console.log("No user found in database. Creating default admin user...");
			defaultUser = await User.register(
				new User({
					email: "sayanhaldar0010@gmail.com",
					username: "sayanhaldar0010",
					fName: "Sayan",
					lName: "Haldar",
				}),
				"Admin@123"
			);
			console.log("Created default user with ID:", defaultUser._id);
		} else {
			console.log("Found existing user for owner:", defaultUser.username, `(${defaultUser._id})`);
		}

		await Listing.deleteMany({});
		const listingsToInsert = initData.data.map((obj) => ({
			...obj,
			owner: defaultUser._id,
			price: obj.price * 25,
			category: [
				categoryAll[Math.floor(Math.random() * categoryAll.length)],
				categoryAll[Math.floor(Math.random() * categoryAll.length)],
			],
		}));

		await Listing.insertMany(listingsToInsert);
		console.log(`Successfully initialized database with ${listingsToInsert.length} listings!`);
	} catch (err) {
		console.error("Error initializing DB:", err);
	} finally {
		await mongoose.disconnect();
		console.log("Disconnected from MongoDB.");
	}
};

initDB();
