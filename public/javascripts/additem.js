"use strict"

$(async function() {
    $("#imageSelect").on("input", (e) => {
        $("#placeholderImg").attr("src", URL.createObjectURL(e.target.files[0]))
    });
});