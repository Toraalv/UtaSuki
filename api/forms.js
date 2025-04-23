"use strict"

const multer = require("multer");
module.exports = {
	upload: multer({ dest: "./.temp/" })
}
// why
const { body, validationResult } = require("express-validator");

