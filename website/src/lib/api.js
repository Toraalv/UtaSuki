import { API_PORT } from "$lib/globals.js";

class UtaSuki_API {
	constructor() {}

	// formatting like this really brings me to tears, tears of happiness
	async login(fetch, formData) {
		try			{ return await this.requestData(fetch, "POST", "login", undefined, formData); }
		catch (e)	{ return { error: e }; }
	}

	async postTrack(fetch, formData) {
		try			{ return await this.requestData(fetch, "POST", "addTrack", undefined, formData); }
		catch (e)	{ return { error: e }; }
	}

	async verifyAuthToken(fetch, authToken) {
		try			{ return (await this.requestData(fetch, "GET", "verifyAuthToken")).data; }
		catch (e)	{ return { error: e }; }
	}

	async fetchUsers(fetch) {
		try			{ return (await this.requestData(fetch, "GET", "users")).data; }
		catch (e)	{ return { error: e }; }
	}

	async fetchYears(fetch, username) {
		try			{ return (await this.requestData(fetch, "GET", "years", { username: username })).data; }
		catch (e)	{ return { error: e }; }
	}

	async fetchTracks(fetch, username, year) {
		try			{ return (await this.requestData(fetch, "GET", "tracks", { username: username, year: year })).data; }
		catch (e)	{ return { error: e }; }
	}

	async requestData(fetch, method, endpoint, args, data) {
		let req = new Request(`http://localhost:${API_PORT}/${endpoint}?data=${JSON.stringify(args)}`, {
			method: method,
			body: data
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
