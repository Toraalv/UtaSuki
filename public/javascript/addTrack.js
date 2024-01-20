"use strict"

const today = new Date();

$(async function() {
	$("#imageSelect").on("input", (e) => {
		$("#placeholderImg").attr("src", URL.createObjectURL(e.target.files[0]));
	});

	if (today.getMonth() == 0) {
		$("#select_year").find(`[value=${today.getFullYear() - 1}]`).attr("selected", true);
		$("#select_month")[0].children[11].setAttribute("selected", true);
	} else {
		$("#select_year").find(`[value=${today.getFullYear()}]`).attr("selected", true);
		$("#select_month")[0].children[today.getMonth() - 1].setAttribute("selected", true);
	}
});