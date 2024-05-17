class UtaSuki_API {
	constructor() {}

	async fetchYears() {
		let res = await (await fetch(`http://localhost:5900/years?data={"username": "Toralv"}`)).json();
		return res.years;
	}

	async fetchTracks(year) {
		let res = await (await fetch(`http://localhost:5900/tracks?data={"username": "Toralv", "year":"${year}"}`)).json();
		return res.tracks;
	}
}

export { UtaSuki_API }
