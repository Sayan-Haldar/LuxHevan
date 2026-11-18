const card = document.querySelector("[data-booking]");
if (card) {
	const nightly = Number(card.dataset.price);
	const checkIn = card.querySelector("#checkIn");
	const checkOut = card.querySelector("#checkOut");
	const guests = card.querySelector("#guests");
	const nightsEl = card.querySelector("[data-nights]");
	const stayEl = card.querySelector("[data-stay]");
	const feeEl = card.querySelector("[data-fee]");
	const taxEl = card.querySelector("[data-tax]");
	const totalEl = card.querySelector("[data-total]");

	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const iso = (date) => date.toISOString().slice(0, 10);
	checkIn.min = iso(today);
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);
	if (!checkIn.value) checkIn.value = iso(today);
	checkOut.min = iso(tomorrow);
	if (!checkOut.value) {
		const plusTwo = new Date(today);
		plusTwo.setDate(plusTwo.getDate() + 2);
		checkOut.value = iso(plusTwo);
	}

	const money = (value) =>
		"\u20B9" + Math.round(value).toLocaleString("en-IN");

	function refresh() {
		const start = new Date(checkIn.value);
		const end = new Date(checkOut.value);
		checkOut.min = iso(new Date(start.getTime() + 86400000));
		const nights = Math.round((end - start) / 86400000);
		if (!nights || nights < 1) {
			nightsEl.textContent = "Pick valid dates";
			stayEl.textContent = "—";
			feeEl.textContent = "—";
			taxEl.textContent = "—";
			totalEl.textContent = "—";
			return;
		}
		const stay = nightly * nights;
		const fee = Math.round(stay * 0.12);
		const tax = Math.round(stay * 0.18);
		nightsEl.textContent = `${money(nightly)} x ${nights} night${nights > 1 ? "s" : ""}`;
		stayEl.textContent = money(stay);
		feeEl.textContent = money(fee);
		taxEl.textContent = money(tax);
		totalEl.textContent = money(stay + fee + tax);
		guests.setAttribute("aria-valuenow", guests.value);
	}

	checkIn.addEventListener("change", refresh);
	checkOut.addEventListener("change", refresh);
	guests.addEventListener("change", refresh);
	refresh();
}
