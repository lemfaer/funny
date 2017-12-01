import React, { Component } from "react"
import ReactDOM from "react-dom"
import { fadein, fadeout } from "./fade"

export default class Modal extends Component {

	constructor(props) {
		super(props)
		this.state = { "open" : false }

		if ( !(this.fade = document.getElementById("modal-fade")) ) {
			this.fade = document.createElement("div")
			this.fade.id = "modal-fade"
			this.fade.className = "modal-backdrop fade show"
			this.fade.style.display = "none"
			document.body.appendChild(this.fade)
		}
	}

	toggle(cb) {
		if (!this.state.open) {
			this.willOpen(cb)
		} else {
			this.willClose(cb)
		}
	}

	componentDidUpdate() {
		if (this.state.open) {
			this.didOpen()
		}
	}

	willOpen(cb) {
		this.setState({ "open" : true })
		document.body.classList.add("modal-open")
		fadein(this.fade, .1, .5, null, 8)
		cb && cb()
	}

	didOpen() {
		fadein(ReactDOM.findDOMNode(this), 1, .1, null, 10)
	}

	willClose(cb) {
		fadeout(ReactDOM.findDOMNode(this), 1, .1, this.didClose.bind(this, cb), 10)
	}

	didClose(cb) {
		this.setState({ "open" : false })
		document.body.classList.remove("modal-open")
		fadeout(this.fade, .5, .05, null, 10)
		cb && cb()
	}

	render() {
		if (!this.state.open) {
			return null
		}

		return (
			<div className="modal show">
				<div className="modal-dialog">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title">{this.props.title}</h5>
							<button type="button" className="close" onClick={this.toggle.bind(this, null)}><span>&times;</span></button>
						</div>
						{this.props.content}
					</div>
				</div>
			</div>
		)
	}

}
