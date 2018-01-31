function ftdate(timestamp) {
	var obj = new Date(timestamp * 1000)

	var hour = obj.getHours()
	var minute = obj.getMinutes()
	var second = obj.getSeconds()

	return sprintf(__("date_time_format"), fdate(timestamp), hour, minute, second)
}

function fdate(timestamp) {
	var obj = new Date(timestamp * 1000)

	var year = obj.getFullYear()
	var month = obj.getMonth() + 1
	var day = obj.getDate()

	return sprintf(__("date_format"), year, month, day)
}

export { fdate, ftdate }
