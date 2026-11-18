// Filters bar horizontal smooth scrolling
const filtersBox = document.querySelector("#filters");
const leftBtn = document.querySelector("#slideLeftBtn");
const rightBtn = document.querySelector("#slideRightBtn");

if (filtersBox) {
	if (leftBtn) {
		leftBtn.addEventListener("click", () => {
			filtersBox.scrollBy({ left: -260, behavior: "smooth" });
		});
	}

	if (rightBtn) {
		rightBtn.addEventListener("click", () => {
			filtersBox.scrollBy({ left: 260, behavior: "smooth" });
		});
	}

	filtersBox.addEventListener("scroll", () => {
		if (leftBtn) {
			leftBtn.style.display = filtersBox.scrollLeft <= 10 ? "none" : "flex";
		}
		if (rightBtn) {
			const maxScroll = filtersBox.scrollWidth - filtersBox.clientWidth - 10;
			rightBtn.style.display = filtersBox.scrollLeft >= maxScroll ? "none" : "flex";
		}
	});

	// Initial check on load
	setTimeout(() => {
		if (rightBtn && filtersBox.scrollWidth > filtersBox.clientWidth) {
			rightBtn.style.display = "flex";
		}
	}, 150);
}
