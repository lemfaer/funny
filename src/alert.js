function salert(message, success) {
	var sbar

	if ( !(sbar = document.getElementById("snackbar")) ) {
		sbar = document.createElement("div")
		sbar.id = "snackbar"
		sbar.className = "snackbar alert"
		document.body.appendChild(sbar)
	}

	if (!message) {
		sbar.classList.remove("show")
		return sbar
	}

	sbar.innerText = message
	sbar.classList.add("show")

	if (success) {
		sbar.classList.add("alert-success")
		sbar.classList.remove("alert-danger")
	} else {
		sbar.classList.add("alert-danger")
		sbar.classList.remove("alert-success")
	}

	setTimeout(salert, 3000)
	return sbar
}

export { salert }
