"use strict";

let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function monthToString(monthNbr)
{
	for (let i = 0; i < months.length; i++)
	{
		if (parseInt(monthNbr) == i + 1)
		{
			return months[i];
		}
	}
}

module.exports = { monthToString };