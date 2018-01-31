import React, { Component } from "react"
import Progress from "./progress.jsx"
import { salert } from "./alert.js"
import Modal from "./modal.jsx"

export default class Parse extends Component {

	constructor(props) {
		super(props)
		this.state = { "lid" : 0, "origin" : null }
	}

	open(lid, origin) {
		this.refs.modal.open(() => {
			this.setState({
				"lid" : +lid,
				"origin" : origin
			})
		})
	}

	close() {
		this.refs.modal.close()
	}

	closed() {
		if (this.state.lid) {
			this.props.end && this.props.end()
			this.refs.progress && this.refs.progress.clear()
		}
	}

	start() {
		let xhr = new XMLHttpRequest()

		xhr.open("POST", "/api/start/parser/")
		xhr.onload = () => {
			if (xhr.readyState !== 4) {
				return
			}

			if (xhr.status === 200) {
				this.setState({ "lid" : +xhr.responseText })
			}

			if (xhr.status !== 200) {
				salert(__("cant_start_parser"), false)
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
							<label htmlFor="parser-minlen">{__("minimum_text_length")}</label>
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

					: <Progress
						ref="progress"
						eta={true}
						lid={this.state.lid}
						origin={this.state.origin}
						end={this.close.bind(this)} />
				}
			</div>

			<div className="modal-footer">
				<button type="button" className="btn btn-light" onClick={this.close.bind(this)}>{__("close")}</button>
				{this.state.lid ? "" :
					<button type="submit" className="btn btn-warning" onClick={this.start.bind(this)}>{__("start")}</button>}
			</div>
			</div>
		)
	}

	render() {
		let title = (!this.state.lid ? __("start_parser") : __("parsing"))
		return <Modal ref="modal" title={title} content={this.form.bind(this)()} close={this.closed.bind(this)} />
	}

}
