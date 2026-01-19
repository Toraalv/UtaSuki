import { CDN_ADDR } from "$lib/globals.js";

class UtaSuki_API {
	constructor() {}

	// POST endpoints
	async login(fetch, formData) {
		try			{ return await this.request(fetch, "POST", "login", formData); }
		catch (e)	{ return e; }
	}
	async register(fetch, formData) {
		try			{ return await this.request(fetch, "POST", "register", formData); }
		catch (e)	{ return e; }
	}
	async logout(fetch, authToken) {
		try			{ return await this.request(fetch, "POST", "logout"); }
		catch (e)	{ return e; }
	}
	async postTrack(fetch, formData) {
		try			{ return await this.request(fetch, "POST", "addTrack", formData); }
		catch (e)	{ return e; }
	}
	async updateSettings(fetch, formData) {
		try			{ return await this.request(fetch, "POST", "updateSettings", formData); }
		catch (e)	{ return e; }
	}
	async updateTrack(fetch, formData) {
		try			{ return await this.request(fetch, "POST", "updateTrack", formData); }
		catch (e)	{ return e; }
	}
	async deleteTrack(fetch, formData) {
		try			{ return await this.request(fetch, "POST", "deleteTrack", formData); }
		catch (e)	{ return e; }
	}
	async deleteAccount(fetch, formData) {
		try			{ return await this.request(fetch, "POST", "deleteAccount", formData); }
		catch (e)	{ return e; }
	}

	// GET endpoints
	async fetchUser(fetch, uid) {
		try			{ return await this.request(fetch, "GET", `user/${uid}`); }
		catch (e)	{ return e; }
	}
	async fetchUsers(fetch) {
		try			{ return await this.request(fetch, "GET", "users"); }
		catch (e)	{ return e; }
	}
	async fetchTracks(fetch, uid) {
		try			{ return await this.request(fetch, "GET", `user/${uid}/tracks`); }
		catch (e)	{ return e; }
	}
	async fetchTracksYear(fetch, uid, year) {
		try			{ return await this.request(fetch, "GET", `user/${uid}/tracks/${year}`); }
		catch (e)	{ return e; }
	}
	async auth(fetch) {
		try			{ return await this.request(fetch, "GET", "status"); } //use status endpoint just to authenticate
		catch (e)	{ return e; }
	}
	async fetchActivity(fetch) {
		try			{ return await this.request(fetch, "GET", "activity"); }
		catch (e)	{ return e; }
	}

	async request(fetch, method, endpoint, data) {
		let req = new Request(`${CDN_ADDR}/${endpoint}`, {
			method: method,
			body: data,
			credentials: "include"
		});

		try {
			const res = await fetch(req);
			const json = await res.json();
			if (res.status !== 200)
				throw {cause: { code: json.code }};
			return json;
		} catch (e) {
			switch (e.cause.code) {
				case "ECONNREFUSED":	throw { code: "error.connection_refused" };		break;
				case "UND_ERR_CONNECT_TIMEOUT":
				case "ETIMEDOUT": 		throw { code: "error.connection_timeout" };		break;
				default: 				throw { code: e.cause.code };					break;
			}
		}
		return {};
	}
}

export { UtaSuki_API }
