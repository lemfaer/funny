function ftdate(timestamp) {
	var obj = new Date(timestamp * 1000)

	var hour = obj.getHours()
	var minute = obj.getMinutes()
	var second = obj.getSeconds()

	return sprintf("%s %02d:%02d:%02d", fdate(timestamp), hour, minute, second)
}

function fdate(timestamp) {
	var obj = new Date(timestamp * 1000)

	var year = obj.getFullYear()
	var month = obj.getMonth() + 1
	var day = obj.getDate()

	return sprintf("%04d-%02d-%02d", year, month, day)
}

export { fdate, ftdate }
