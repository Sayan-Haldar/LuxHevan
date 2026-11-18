// Modal DOM elements
const modalBackdrop = document.querySelector(".showfilter");
const pageBlur = document.querySelector(".pageblur");

function filterClick() {
	if (modalBackdrop) {
		modalBackdrop.classList.add("filterbtnClick");
	}
	if (pageBlur) {
		pageBlur.classList.add("containerblur");
	}
	document.body.style.overflow = "hidden";
}

function closefilter() {
	if (modalBackdrop) {
		modalBackdrop.classList.remove("filterbtnClick");
	}
	if (pageBlur) {
		pageBlur.classList.remove("containerblur");
	}
	document.body.style.overflow = "";
}

// Close on backdrop click
if (modalBackdrop) {
	modalBackdrop.addEventListener("click", (e) => {
		if (e.target === modalBackdrop) {
			closefilter();
		}
	});
}

// Close on Escape key
window.addEventListener("keydown", (e) => {
	if (e.key === "Escape") {
		closefilter();
	}
});

// Helper for quick price presets
function setPriceRange(min, max) {
	const minInput = document.getElementById("filterMinPrice");
	const maxInput = document.getElementById("filterMaxPrice");
	if (minInput) minInput.value = min || "";
	if (maxInput) maxInput.value = max || "";
}

// Helper to reset modal inputs
function clearAllModalFilters() {
	const form = document.getElementById("filterModalForm");
	if (form) {
		const qInput = document.getElementById("filterModalQuery");
		if (qInput) qInput.value = "";
		setPriceRange("", "");
		const allRadio = document.getElementById("mcat-0");
		if (allRadio) allRadio.checked = true;
	}
}
