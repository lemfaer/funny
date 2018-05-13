import React, { Component } from "react"
import { salert } from "./alert.js"
import Header from "./header.jsx"

export default class Predict extends Component {

	constructor(props) {
		super(props)
		this.state = {
			"data" : {
				"text" : sessionStorage.getItem("main-text"),
				"analysis" : sessionStorage.getItem("main-analysis")
			},
			"valid" : false,
			"validated" : false,
			"errors" : {}
		}
	}

	componentDidMount() {
		document.title = __("predict")
	}

	valid({ text = this.refs.text.value } = {}) {
		let errors = {}
		let answer = true

		if (!text) {
			errors.text = __("text_cannot_be_empty")
			answer = false
		}

		return [ answer, errors ]
	}

	validate() {
		let [ valid, errors ] = this.valid()
		this.setState({ valid, errors, "validated" : true })
		return valid
	}

	update({ text = this.refs.text.value } = {}) {
		sessionStorage.setItem("main-text", text)
		this.setState({ "data" : {text}, "validated" : false })
	}

	reset(clear = true) {
		let text = (!clear ? this.refs.text.value : "")
		sessionStorage.removeItem("main-analysis")
		clear && sessionStorage.removeItem("main-text")
		this.setState({ "data" : {text}, "validated" : false })
	}

	submit() {
		if (!this.validate()) {
			return
		}

		let xhr = new XMLHttpRequest()

		xhr.open("POST", "/api/start/predict/")
		xhr.onload = () => {
			if (xhr.readyState !== 4) {
				return
			}

			if (xhr.status === 200) {
				let analysis = xhr.responseText
				let text = this.state.data.text
				sessionStorage.setItem("main-analysis", analysis)
				this.setState({ "data" : { text, analysis } })
			}

			if (xhr.status !== 200) {
				salert(__("cant_start_classifier"), false)
			}
		}

		let params = { "text" : this.state.data.text }
		let json = JSON.stringify(params)

		xhr.setRequestHeader("Content-Type", "application/json")
		xhr.send(json)
	}

	save(type) {
		let xhr = new XMLHttpRequest()

		xhr.open("POST", "/api/text/")
		xhr.onload = () => {
			if (xhr.readyState !== 4) {
				return
			}

			if (xhr.status === 200) {
				salert(__("text_created"), true)
			}

			if (xhr.status !== 200) {
				salert(__("cant_save_text"), false)
			}
		}

		let text = JSON.stringify({
			"class" : type,
			"text"  : this.state.data.text,
			"temp"  : "NO"
		})

		xhr.setRequestHeader("Content-Type", "application/json")
		xhr.send(text)
		this.reset()
	}

	form() {
		return (
			<form id="text-form" class={this.state.validated ? "was-validated" : ""}>
				<div className="form-group mt-3">
					<div>
						<label
							className="h4"
							htmlFor="text-text">
								{this.state.data.analysis ? __("text") : __("input")}
						</label>
						{this.state.data.analysis &&
							<span
								className="octicon octicon-sync ml-2"
								onClick={this.reset.bind(this, false)}>
							</span>
						}
					</div>
					<textarea
						ref="text"
						id="text-text"
						name="link"
						value={this.state.data.text}
						className="form-control main-text"
						rows="17"
						onChange={this.update.bind(this)}
						readOnly={!!this.state.data.analysis}
						required
						/>
					{this.state.errors.text &&
						<div className="invalid-feedback is-invalid">
							{this.state.errors.text}
						</div>
					}
				</div>
			</form>
		)
	}

	top() {
		if (!this.state.data.analysis) {
			return
		}

		let json = this.state.data.analysis
		let analysis = JSON.parse(json)
		let top = analysis.top
		let entities = []

		for (let i in top) {
			let word = top[i][0]
			let cls = (top[i][1] > 0 ? "positive" : "negative")
			let entity = <li key={i} className={cls}>{word}</li>
			entities.push(entity)
		}

		return (
			<ul className="text-tags">
				{entities}
			</ul>
		)
	}

	gui() {
		let json = this.state.data.analysis
		let analysis = json && JSON.parse(json)

		return (
			<form id="gui-form">
				{!analysis
					? <div className="form-group d-flex justify-content-center">
						<button
							form="text-form"
							type="button"
							className="col-4 btn btn-lg btn-block btn-warning"
							onClick={this.submit.bind(this)}>
								{__("predict")}
						</button>
					</div>

					: <div className="form-group d-flex justify-content-around">
						<button
							type="button" 
							className={"col-3 btn btn-lg"
							+ (analysis.type === "positive" ? " btn-success chosen " : " btn-outline-success ")}
							onClick={this.save.bind(this, "positive")}>
								<span className="type">{__("positive")}</span>
						</button>

						<button
							type="button" 
							className={"col-3 btn btn-lg"
							+ (analysis.type === "normal" ? " btn-info chosen " : " btn-outline-info ")}
							onClick={this.save.bind(this, "normal")}>
								<span className="type">{__("normal")}</span>
						</button>

						<button
							type="button" 
							className={"col-3 btn btn-lg"
							+ (analysis.type === "negative" ? " btn-danger chosen " : " btn-outline-danger ")}
							onClick={this.save.bind(this, "negative")}>
								<span className="type">{__("negative")}</span>
						</button>
					</div>
				}
			</form>
		)
	}

	render() {
		return (
			<div>
				<Header current="/predict" />
				<div className="container col-8">
					{this.form()}
					{this.top()}
					{this.gui()}
				</div>
			</div>
		)
	}

}
