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
	},
	// credit goes to bryc (github.com/bryc)
	cyrb53: function(str, seed = 0) {
		let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
		for(let i = 0, ch; i < str.length; i++) {
			ch = str.charCodeAt(i);
			h1 = Math.imul(h1 ^ ch, 2654435761);
			h2 = Math.imul(h2 ^ ch, 1597334677);
		}
		h1	= Math.imul(h1 ^ (h1 >>> 16), 2246822507);
		h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
		h2	= Math.imul(h2 ^ (h2 >>> 16), 2246822507);
		h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
		return 4294967296 * (2097151 & h2) + (h1 >>> 0);
	}
}

