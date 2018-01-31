import React, { Component } from "react"
import { salert } from "./alert.js"
import Modal from "./modal.jsx"

export default class Text extends Component {

	constructor(props) {
		super(props)
		this.state = { "id" : 0, "text" : "", "class" : "normal", "persist" : true, "timer" : null }
	}

	open(id, text, cls, temp) {
		this.refs.modal.open(() => {
			this.setState({
				"id"      : +id  || 0,
				"text"    : text || "",
				"class"   : cls  || "normal",
				"persist" : temp !== "YES"
			})
		})
	}

	close() {
		this.refs.modal.close()
	}

	update() {
		this.setState({
			"text"    : this.refs.text.value,
			"class"   : this.refs.class.value,
			"persist" : this.refs.persist.checked
		})
	}

	validate() {
		let errors
		for (let input of [ this.refs.text, this.refs.class ]) {
			let error = this.error(input.name, input.value) || ""
			errors = errors || error

			input.form.classList.add("was-validated")
			input.nextSibling.classList.add("is-invalid")
			input.nextSibling.innerHTML = error
			input.setCustomValidity(error)
		}

		return !errors
	}

	error(key, value) {
		if (key === "text" && !value) {
			return __("text_cannot_be_empty")
		}

		if (key === "class" && [ "positive", "negative", "normal" ].indexOf(value) === -1) {
			return __("wrong_class_value")
		}
	}

	save(event) {
		event.preventDefault()
		event.stopPropagation()

		if (!this.validate()) {
			return
		}

		let xhr = new XMLHttpRequest()

		xhr.open("POST", "/api/text/" + (this.state.id + "/" || ""))
		xhr.onload = () => {
			if (xhr.readyState !== 4) {
				return
			}

			if (xhr.status === 200 && !this.state.id) {
				salert(__("text_created"), true)
			}

			if (xhr.status === 200 && this.state.id) {
				salert(sprintf(__("text_num_updated"), this.state.id), true)
			}

			if (xhr.status !== 200) {
				salert(__("cant_save_text"), false)
			}
		}

		let text = JSON.stringify({
			"text"  : this.state.text,
			"class" : this.state.class,
			"temp"  : (this.state.persist ? "NO" : "YES")
		})

		xhr.setRequestHeader("Content-Type", "application/json")
		xhr.send(text)
		this.close()
	}

	delete() {
		if (!this.state.id) {
			return
		}

		let xhr = new XMLHttpRequest()

		xhr.open("DELETE", sprintf("/api/text/%d/", this.state.id))
		xhr.onload = () => {
			if (xhr.readyState !== 4) {
				return
			}

			if (xhr.status === 200) {
				salert(sprintf(__("text_num_deleted"), this.state.id), true)
			}

			if (xhr.status !== 200) {
				salert(__("cant_delete_text"), false)
			}
		}

		xhr.send()
		this.close()
	}

	form() {
		return (
			<div>
			<div className="modal-body">
				<form id="text-form">
					<div className="form-group">
						<label htmlFor="text-text">{__("text")}</label>
						<textarea
							ref="text"
							id="text-text"
							name="text"
							value={this.state.text}
							className="form-control"
							rows="7"
							onChange={this.update.bind(this)}
							required
						/>
						<div className="invalid-feedback"></div>
					</div>

					<div className="form-group">
						<label htmlFor="text-class">{__("class")}</label>
						<select
							ref="class"
							id="text-class"
							name="class"
							value={this.state.class}
							className="form-control"
							onChange={this.update.bind(this)}
							required>

							<option value="positive">{__("positive")}</option>
							<option value="negative">{__("negative")}</option>
							<option value="normal">{__("normal")}</option>
						</select>
						<div className="invalid-feedback"></div>
					</div>

					<div className="form-check">
						<label className="form-check-label">
							<input
								ref="persist"
								type="checkbox"
								id="text-persist"
								name="persist"
								checked={this.state.persist}
								className="form-check-input"
								onChange={this.update.bind(this)}
							/>
							{__("persist")}
							<div className="invalid-feedback"></div>
						</label>
					</div>
				</form>
			</div>

			<div className="modal-footer">
				<button form="text-form" type="button" className="btn btn-light" onClick={this.close.bind(this)}>{__("close")}</button>
				{!this.state.id ? "" :
					<button form="text-form" type="button" className="btn btn-danger" onClick={this.delete.bind(this)}>{__("delete")}</button>}
				<button form="text-form" type="submit" className="btn btn-warning" onClick={this.save.bind(this)}>{__("save")}</button>
			</div>
			</div>
		)
	}

	render() {
		return (
			<Modal ref="modal"
				title={!this.state.id ? __("enter_text_to_classify") : sprintf(__("update_text_num"), this.state.id)}
				content={this.form.bind(this)()}
			/>
		)
	}

}
