import React, { Component } from "react"
import Modal from "./modal.jsx"

export default class Page extends Component {

	constructor(props) {
		super(props)
		this.state = { "id" : 0, "link" : "", "timer" : null }
		this.rkpo = /^(https?:\/\/)?(www\.)?kinopoisk\.ru.*$/i
		this.rwiki = /^(https?:\/\/)?(www\.)?([a-z]{2})?\.?wikipedia\.org.*$/i
		this.rlimdb = /^(https?:\/\/)?(www\.)?imdb\.com.*love.*$/i
		this.rhimdb = /^(https?:\/\/)?(www\.)?imdb\.com.*hate.*$/i
	}

	toggle(id, link) {
		id = +id || 0
		link = link || ""
		this.refs.modal.toggle(() => {
			this.setState({ "id" : id, "link" : link })
		})
	}

	uplink(event) {
		clearTimeout(this.state.timer)
		let time = (!event.target.validity.customError ? 1000 : 0)
		let timer = setTimeout(this.validate.bind(this, event), time)
		this.setState({ "link" : event.target.value, "timer" : timer })
		event.persist()
	}

	validate(event) {
		let input = event.target
		let error = this.error(input.name, input.value) || ""

		input.form.classList.add("was-validated")
		input.nextSibling.classList.add("is-invalid")
		input.nextSibling.innerHTML = error
		input.setCustomValidity(error)
	}

	error(key, value) {
		if (!value) {
			return "Link cannot be empty"
		}

		if (!this.rkpo.test(value) && !this.rwiki.test(value)
				&& !this.rlimdb.test(value) && !this.rhimdb.test(value)) {

			return "Unsupported link value"
		}
	}

	data(link) {
		let obj = {}

		obj.link = link
		obj.link = decodeURI(obj.link)
		obj.link = encodeURI(obj.link)

		if (!/^https?:\/\//i.test(obj.link)) {
			obj.link = "http://" + obj.link;
		}

		if (this.rwiki.test(obj.link)) {
			obj.normal = "p"
			obj.rremove = "/(\\[.*\\])|(\\{.*\\})/"
		}

		if (this.rlimdb.test(obj.link)) {
			obj.positive = "p"
		}

		if (this.rhimdb.test(obj.link)) {
			obj.negative = "p"
		}

		return obj
	}

	save(event) {
		event.preventDefault()
		event.stopPropagation()

		if (this.error("link", this.state.link)) {
			return
		}

		let xhr = new XMLHttpRequest()

		xhr.open("POST", "http://localhost/api/page/" + (this.state.id || ""))
		xhr.onload = () => {
			if (xhr.readyState !== 4) {
				return
			}

			// alert if xhr.status === 200 success
			// othervise failure
		}

		let page = this.data(this.state.link)
		let json = JSON.stringify(page)

		xhr.setRequestHeader("Content-Type", "application/json")
		xhr.send(json)
		this.toggle()
	}

	delete() {
		if (!this.state.id) {
			return
		}

		let xhr = new XMLHttpRequest()

		xhr.open("DELETE", "http://localhost/api/page/" + this.state.id)
		xhr.onload = () => {
			if (xhr.readyState !== 4) {
				return
			}

			// alert if xhr.status === 200 success
			// othervise failure
		}

		xhr.send()
		this.toggle()
	}

	form() {
		return (
			<div>
			<div className="modal-body">
				<form id="page-form">
					<div className="form-group">
						<input
							type="text"
							id="page-link"
							name="link"
							value={decodeURI(this.state.link)}
							className="form-control"
							onChange={this.uplink.bind(this)}
							onBlur={this.validate.bind(this)}
							onReset={this.validate.bind(this)}
							required
							/>
						<div className="invalid-feedback"></div>
					</div>
				</form>
			</div>

			<div className="modal-footer">
				<button form="page-form" type="button" className="btn btn-light" onClick={this.toggle.bind(this)}>Close</button>
				{!this.state.id ? "" :
					<button form="page-form" type="button" className="btn btn-danger" onClick={this.delete.bind(this)}>Delete</button>}
				<button form="page-form" type="submit" className="btn btn-warning" onClick={this.save.bind(this)}>Save</button>
			</div>
			</div>
		)
	}

	render() {
		return (
			<Modal ref="modal"
				title={!this.state.id ? "Enter link to parse" : `Update link ${this.state.id}`}
				content={this.form.bind(this)()}
			/>
		)
	}

}
