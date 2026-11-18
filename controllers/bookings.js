const Booking = require("../models/booking");
const Listing = require("../models/listing");

const MS_DAY = 1000 * 60 * 60 * 24;

function startOfDay(value) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;
	date.setHours(0, 0, 0, 0);
	return date;
}

function quote(price, checkIn, checkOut, guests) {
	const nights = Math.round((checkOut - checkIn) / MS_DAY);
	const stay = price * nights;
	const serviceFee = Math.round(stay * 0.12);
	const taxes = Math.round(stay * 0.18);
	return {
		nights,
		guests,
		nightlyPrice: price,
		serviceFee,
		taxes,
		total: stay + serviceFee + taxes,
	};
}

module.exports.createBooking = async (req, res) => {
	const { id } = req.params;
	const listing = await Listing.findById(id);
	if (!listing) {
		req.flash("error", "That stay is no longer available.");
		return res.redirect("/listings");
	}
	if (listing.owner.equals(req.user._id)) {
		req.flash("error", "You cannot reserve your own listing.");
		return res.redirect(`/listings/${id}`);
	}

	const checkIn = startOfDay(req.body.checkIn);
	const checkOut = startOfDay(req.body.checkOut);
	const guests = Number(req.body.guests);
	const today = startOfDay(new Date());

	if (!checkIn || !checkOut || checkIn < today || checkOut <= checkIn) {
		req.flash("error", "Choose a check-in date and a later check-out date.");
		return res.redirect(`/listings/${id}`);
	}
	if (!Number.isInteger(guests) || guests < 1 || guests > 16) {
		req.flash("error", "Guests must be between 1 and 16.");
		return res.redirect(`/listings/${id}`);
	}

	const overlap = await Booking.findOne({
		listing: listing._id,
		status: "confirmed",
		checkIn: { $lt: checkOut },
		checkOut: { $gt: checkIn },
	});
	if (overlap) {
		req.flash("error", "Those dates are already reserved. Try another range.");
		return res.redirect(`/listings/${id}`);
	}

	const priced = quote(listing.price, checkIn, checkOut, guests);
	await Booking.create({
		listing: listing._id,
		guest: req.user._id,
		checkIn,
		checkOut,
		...priced,
	});
	req.flash("success", "Your stay is reserved.");
	res.redirect("/bookings");
};

module.exports.myBookings = async (req, res) => {
	const bookings = await Booking.find({ guest: req.user._id })
		.populate("listing")
		.sort({ checkIn: 1 });
	res.render("bookings/index.ejs", { bookings });
};

module.exports.cancelBooking = async (req, res) => {
	const booking = await Booking.findById(req.params.id);
	if (!booking || !booking.guest.equals(req.user._id)) {
		req.flash("error", "That reservation could not be cancelled.");
		return res.redirect("/bookings");
	}
	booking.status = "cancelled";
	await booking.save();
	req.flash("success", "Reservation cancelled.");
	res.redirect("/bookings");
};
