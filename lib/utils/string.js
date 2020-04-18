const capitalize = (string) => {
	return string.replace('-', ' ').replace(/(?:^|\s)\S/g, (a) => a.toUpperCase())
}

const camelCase = (string) => {
	return capitalize(string).replace(' ', '')
}

module.exports = { camelCase, capitalize }
