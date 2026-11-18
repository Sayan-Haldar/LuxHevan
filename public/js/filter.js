// Filters scroll slide buttons
const filtersBox = document.querySelector("#filters");
const buttonSlide = document.querySelectorAll("#slideButton");

if (buttonSlide.length >= 2 && filtersBox) {
	buttonSlide.forEach((button) => {
		button.addEventListener("click", () => {
			const direction = button.classList.contains("left_img_button") ? -1 : 1;
			const scrollAmount = direction * Math.max(filtersBox.clientWidth - 120, 200);
			filtersBox.scrollBy({ left: scrollAmount, behavior: "smooth" });
		});
	});

	filtersBox.addEventListener("scroll", () => {
		buttonSlide[0].style.display = filtersBox.scrollLeft <= 5 ? "none" : "flex";
		buttonSlide[1].style.display =
			filtersBox.scrollLeft >= filtersBox.scrollWidth - filtersBox.clientWidth - 5
				? "none"
				: "flex";
	});
}
