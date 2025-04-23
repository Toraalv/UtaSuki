"use strict"

require("dotenv").config();
const VERSION = process.env.npm_package_version;

module.exports = {
	// https://www.w3schools.com/js/js_cookies.asp
	getCookie: function(cname, cookie) {
		let name = cname + "=";
		let decodedCookie = decodeURIComponent(cookie);
		let ca = decodedCookie.split(';');
		for (let i = 0; i < ca.length; i++) {
			let c = ca[i];
			while (c.charAt(0) == ' ') {
				c = c.substring(1);
			}
			if (c.indexOf(name) == 0)
				return c.substring(name.length, c.length);
		}
		return "";
	},
	sendStatus: function(req, res, status, code, data) {
		res.status(status).json({
			version: VERSION,
			code: code,
			data: data,
			auth_info: {
				authed: req.authed,
				profile: req.profile
			}
		});
	}
}

