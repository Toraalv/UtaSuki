import { dev } from "$app/environment";

const PORT = dev ? 5900 : 8800;

class UtaSuki_API {
	constructor() {}

	async fetchYears(fetch) {
		try {
			let res = await this.fetchData(fetch, "years", { username: "Toralv" });
			return res.years;
		} catch (e) {
			return { error: e };
		}
	}

	async fetchTracks(fetch, year) {
		try {
			let res = await this.fetchData(fetch, "tracks", { username: "Toralv", year: year });
			return res.tracks;
		} catch (e) {
			return { error: e };
		}
	}

	async fetchData(fetch, endpoint, args) {
		let req = new Request(`http://localhost:${PORT}/${endpoint}?data=${JSON.stringify(args)}`, {
			method: "GET",
		});

		try {
			const res = await fetch(req);
			const json = await res.json();
			if (res.status !== 200)
				throw {cause: { code: "SERVER_FAULT", msg: json.message }};
			return json;
		} catch (e) {
			switch (e.cause.code) {
				case "SERVER_FAULT":	throw { severity: e.cause.msg.severity, code: e.cause.msg.code };	break;
				case "ECONNREFUSED":	throw { severity: "error", code: "error.connection_refused" };		break;
				case "UND_ERR_CONNECT_TIMEOUT":
				case "ETIMEDOUT": 		throw { severity: "error", code: "error.connection_timeout" };		break;
				default: 				throw { severity: "error", code: "error.endpoint_default" };		break;
			}
		}

		return {};
	}
}

export { UtaSuki_API }
