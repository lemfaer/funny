function fadein(element, from, to, cb, iv) {
	var op = from
	element.style.opacity = op
	element.style.display = "block"

	var timer = setInterval(function () {
		if (op >= to) {
			clearInterval(timer)
			cb && cb()
		}

		element.style.opacity = op
		element.style.filter = "alpha(opacity=" + op * 100 + ")"
		op += op * 0.1
	}, iv);
}

function fadeout(element, from, to, cb, iv) {
	var op = from
	element.style.opacity = op
	element.style.display = "block"

	var timer = setInterval(function () {
		if (op <= to) {
			clearInterval(timer)
			element.style.display = "none"
			cb && cb()
		}

		element.style.opacity = op
		element.style.filter = "alpha(opacity=" + op * 100 + ")"
		op -= op * 0.1
	}, iv)
}

export { fadein, fadeout }
