class UtaSuki_API {
	constructor() {}

	async fetchYears() {
		let res = await (await fetch(`http://localhost:5900/years?data={"username": "toralv"}`)).json();
		return res.years;
	}

	async fetchTracks() {
		let res = await (await fetch())
	}
}

export { UtaSuki_API }
