import React, { Component } from "react"
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
			return "Text cannot be empty"
		}

		if (key === "class" && [ "positive", "negative", "normal" ].indexOf(value) === -1) {
			return "Wrong class value"
		}
	}

	save(event) {
		event.preventDefault()
		event.stopPropagation()

		if (!this.validate()) {
			return
		}

		let xhr = new XMLHttpRequest()

		xhr.open("POST", "http://localhost/api/text/" + (this.state.id || ""))
		xhr.onload = () => {
			if (xhr.readyState !== 4) {
				return
			}

			// alert if xhr.status === 200 success
			// othervise failure
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

		xhr.open("DELETE", "http://localhost/api/text/" + this.state.id)
		xhr.onload = () => {
			if (xhr.readyState !== 4) {
				return
			}

			// alert if xhr.status === 200 success
			// othervise failure
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
						<label htmlFor="text-text">Text</label>
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
						<label htmlFor="text-class">Class</label>
						<select
							ref="class"
							id="text-class"
							name="class"
							value={this.state.class}
							className="form-control"
							onChange={this.update.bind(this)}
							required>

							<option value="positive">positive</option>
							<option value="negative">negative</option>
							<option value="normal">normal</option>
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
							Persist
							<div className="invalid-feedback"></div>
						</label>
					</div>
				</form>
			</div>

			<div className="modal-footer">
				<button form="text-form" type="button" className="btn btn-light" onClick={this.close.bind(this)}>Close</button>
				{!this.state.id ? "" :
					<button form="text-form" type="button" className="btn btn-danger" onClick={this.delete.bind(this)}>Delete</button>}
				<button form="text-form" type="submit" className="btn btn-warning" onClick={this.save.bind(this)}>Save</button>
			</div>
			</div>
		)
	}

	render() {
		return (
			<Modal ref="modal"
				title={!this.state.id ? "Enter text to classify" : `Update text ${this.state.id}`}
				content={this.form.bind(this)()}
			/>
		)
	}

}
