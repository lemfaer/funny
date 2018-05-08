import React, { Component } from "react"
import { pages } from "../config.json"
import { salert } from "./alert.js"
import Modal from "./modal.jsx"

export default class Page extends Component {

	constructor(props) {
		super(props)
		this.state = {
			"id" : 0,
			"link" : "",
			"recurrence" : null,
			"timer" : null
		}
	}

	open(id, link, recurrence) {
		id = +id || 0
		link = link || ""
		recurrence = recurrence || null

		this.refs.modal.open(() => {
			this.setState({
				"id" : id,
				"link" : link,
				"recurrence" : recurrence
			})
		})
	}

	close() {
		this.refs.modal.close()
	}

	uplink(event) {
		clearTimeout(this.state.timer)
		let time = (!event.target.validity.customError ? 1000 : 0)
		let timer = setTimeout(this.validate.bind(this, event), time)
		this.setState({ "link" : event.target.value, "timer" : timer })
		event.persist()
	}

	uprecur(event) {
		this.setState({ "recurrence" : event.target.value })
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
			return __("link_cannot_be_empty")
		}

		let matched = false
		for (let name in pages) {
			let page = pages[name]
			let regex = new RegExp(page.match, page.flags)

			if (regex.test(value)) {
				matched = true
			}
		}

		if (!matched) {
			return __("unsupported_link_value")
		}
	}

	data(link, recurrence) {
		let obj = {}

		obj.link = link
		obj.link = decodeURI(obj.link)
		obj.link = encodeURI(obj.link)

		if (!/^https?:\/\//i.test(obj.link)) {
			obj.link = "http://" + obj.link
		}

		if (recurrence !== "none") {
			obj.recurrence = recurrence
		} else {
			obj.recurrence = null
		}

		for (let name in pages) {
			let page = pages[name]
			let regex = new RegExp(page.match, page.flags)

			if (regex.test(link)) {
				obj.normal = page.normal
				obj.positive = page.positive
				obj.negative = page.negative
				obj.rremove = page.rremove
			}
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

		xhr.open("POST", `/api/page/${this.state.id}/`)
		xhr.onload = () => {
			if (xhr.readyState !== 4) {
				return
			}

			if (xhr.status === 200 && !this.state.id) {
				salert(__("page_created"), true)
			}

			if (xhr.status === 200 && this.state.id) {
				salert(sprintf(__("page_num_updated"), this.state.id), true)
			}

			if (xhr.status !== 200) {
				salert(__("cant_save_page"), false)
			}
		}

		let page = this.data(this.state.link, this.state.recurrence)
		let json = JSON.stringify(page)

		xhr.setRequestHeader("Content-Type", "application/json")
		xhr.send(json)
		this.close()
	}

	delete() {
		if (!this.state.id) {
			return
		}

		let xhr = new XMLHttpRequest()

		xhr.open("DELETE", `/api/page/${this.state.id}/`)
		xhr.onload = () => {
			if (xhr.readyState !== 4) {
				return
			}

			if (xhr.status === 200) {
				salert(sprintf(__("page_num_deleted"), this.state.id), true)
			}

			if (xhr.status !== 200) {
				salert(__("cant_delete_page"), false)
			}
		}

		xhr.send()
		this.close()
	}

	form() {
		return (
			<div>
			<div className="modal-body">
				<form id="page-form">
					<div className="form-group">
						<label htmlFor="page-link">{__("link")}</label>
						<input
							ref="link"
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
					<div className="form-group">
						<label htmlFor="page-recurrence">{__("follow")}</label>
						<select
							ref="recurrence"
							id="page-recurrence"
							name="recurrence"
							value={this.state.recurrence}
							onChange={this.uprecur.bind(this)}
							className="form-control"
							required>

							<option value="none">{__("none")}</option>
							<option value="weekly">{__("weekly")}</option>
							<option value="bi-weekly">{__("bi-weekly")}</option>
							<option value="monthly">{__("monthly")}</option>
						</select>
						<div className="invalid-feedback"></div>
					</div>
				</form>
			</div>

			<div className="modal-footer">
				<button form="page-form" type="button" className="btn btn-light" onClick={this.close.bind(this)}>{__("close")}</button>
				{!this.state.id ? "" :
					<button form="page-form" type="button" className="btn btn-danger" onClick={this.delete.bind(this)}>{__("delete")}</button>}
				<button form="page-form" type="submit" className="btn btn-warning" onClick={this.save.bind(this)}>{__("save")}</button>
			</div>
			</div>
		)
	}

	render() {
		return (
			<Modal ref="modal"
				title={!this.state.id ? __("enter_link_to_parse") : sprintf(__("update_link_num"), this.state.id)}
				content={this.form.bind(this)()}
			/>
		)
	}

}
