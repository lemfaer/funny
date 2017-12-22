import React, { Component } from "react"
import Progress from "./progress.jsx"
import Modal from "./modal.jsx"

export default class Parse extends Component {

	constructor(props) {
		super(props)
		this.state = { "lid" : 0 }
	}

	open(lid) {
		this.refs.modal.open(() => {
			this.setState({ "lid" : +lid })
		})
	}

	close() {
		this.refs.progress.clear()
		this.refs.modal.close()
	}

	start() {
		let xhr = new XMLHttpRequest()

		xhr.open("POST", "http://localhost/api/start/parser")
		xhr.onload = () => {
			if (xhr.readyState !== 4) {
				return
			}

			if (xhr.status === 200) {
				this.setState({ "lid" : +xhr.responseText })
			}

			if (xhr.status !== 200) {
				// alert
			}
		}

		let params = { "minlen" : +this.refs.minlen.value }
		let json = JSON.stringify(params)

		xhr.setRequestHeader("Content-Type", "application/json")
		xhr.send(json)
	}

	form() {
		return (
			<div>
			<div className="modal-body">
				{!this.state.lid
					? <form id="parser-form">
						<div className="form-group">
							<label htmlFor="parser-minlen">Minimum text length</label>
							<input
								type="number"
								id="parser-minlen"
								name="minlen"
								ref="minlen"
								min="1"
								defaultValue="500"
								className="form-control"
								required
								/>
							<div className="invalid-feedback"></div>
						</div>
					</form>

					: <Progress ref="progress" lid={this.state.lid} eta={true} end={this.close.bind(this)} />
				}
			</div>

			<div className="modal-footer">
				<button form="page-form" type="button" className="btn btn-light" onClick={this.close.bind(this)}>Close</button>
				{this.state.lid ? "" :
					<button form="page-form" type="submit" className="btn btn-warning" onClick={this.start.bind(this)}>Start</button>}
			</div>
			</div>
		)
	}

	render() {
		let title = (!this.state.lid ? "Start parser" : "Parsing")
		return <Modal ref="modal" title={title} content={this.form.bind(this)()} />
	}

}
