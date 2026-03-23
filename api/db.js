"use strict"

require("dotenv").config();
const mariadb = require("mariadb");

const pool = mariadb.createPool({
	socketPath: "/run/mysqld/mysqld.sock",
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	connectionLimit: 5
});

module.exports = {
	dbQuery: async function(query, params) {
		return new Promise(function(resolve, reject) {
			try {
				pool.getConnection().then(conn => {
					conn.query(query, params).then(rows => resolve(rows)).catch(e => reject(e)).then(() => conn.close());
				}).catch(e => reject(e));
			} catch (e) { console.log(e); }
		});
	}
}

