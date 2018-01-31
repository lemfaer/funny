import React, { Component } from "react"
import { ngrams } from "../config.json"
import Progress from "./progress.jsx"
import { salert } from "./alert.js"
import Modal from "./modal.jsx"

export default class Classify extends Component {

	constructor(props) {
		super(props)

		this.stages = [
			"prepare",
			"objective",
			"sentiment"
		]

		this.state = {
			"lid" : 0,
			"origin" : null,
			"test" : 20,
			"stage" : null,
			"start" : null,
			"kernel" : "rbf",
			"unigram" : true,
			"bigram" : true,
			"trigram" : false,
			"chars4" : false,
			"liter" : 1000,
			"lpass" : 10,
			"sigma" : 1,
			"tol" : 0.1,
			"c" : 1
		}
	}

	open(lid, origin) {
		this.refs.modal.open(() => {
			this.setState({
				"lid" : +lid,
				"origin" : origin
			})
		})
	}

	stage() {
		let stats = this.refs.progress && this.refs.progress.state.stats || {}
		let info = stats.info && JSON.parse(stats.info) || {}
		let stage = info.stage || this.state.stage || this.stages[0]
		this.setState({ "stage" : stage })
		return stage
	}

	ended() {
		if (!this.refs.progress.state.watch) {
			this.refs.progress.setState({ "alert" : true })
			this.close(true)
			return
		}

		if (this.stage() === this.stages[2]) {
			this.refs.progress.setState({ "alert" : true })
			this.close(true)
			return
		}

		// next phase
		this.refs.progress.setState({ "alert" : false })
		this.refs.progress.reset()
	}

	close(modal) {
		if (modal) {
			this.refs.modal.close()
		}

		if (!modal && this.state.lid) {
			this.props.end && this.props.end()
			this.refs.progress && this.refs.progress.clear()
		}
	}

	start() {
		let xhr = new XMLHttpRequest()

		xhr.open("POST", "/api/start/classifier/")
		xhr.onload = () => {
			if (xhr.readyState !== 4) {
				return
			}

			if (xhr.status === 200) {
				this.setState({ "lid" : +xhr.responseText })
			}

			if (xhr.status !== 200) {
				salert(__("cant_start_classifier"), false)
			}
		}

		let ingrams = 0
		let engrams = [ this.refs.unigram, this.refs.bigram, this.refs.trigram, this.refs.chars4 ]

		for (let elem of engrams) {
			for (let key in ngrams) {
				if (elem.checked && elem.name === ngrams[key]) {
					ingrams |= key
				}
			}
		}

		let params = {
			"ngrams" : ingrams,
			"lpass" : this.state.lpass,
			"liter" : this.state.liter,
			"kernel" : (this.refs.kernel.value === "linear" ? "linear" : "rbf"),
			"sigma" : parseFloat(this.refs.sigma.value) || this.state.sigma,
			"test" : parseInt(this.refs.test.value) || this.state.test,
			"tol" : parseFloat(this.refs.tol.value) || this.state.tol,
			"c" : parseFloat(this.refs.c.value) || this.state.c
		}

		xhr.setRequestHeader("Content-Type", "application/json")
		xhr.send(JSON.stringify(params))
	}

	form() {
		return (
			<div>
			<div className="modal-body">
				{!this.state.lid
					? <form id="classifier-form">
						<div className="form-group">
							<label htmlFor="classifier-kernel">{__("kernel_type")}</label>
							<select
								ref="kernel"
								id="classifier-kernel"
								name="kernel"
								defaultValue={this.state.kernel}
								className="form-control"
								required>

								<option value="linear">{__("linear")}</option>
								<option value="rbf">{__("rbf")}</option>
							</select>
							<div className="invalid-feedback"></div>
						</div>

						<div className="form-group">
							<label htmlFor="classifier-test">{__("test_set_size")}</label>
							<input
								ref="test"
								type="range"
								id="classifier-test"
								name="test"
								min="0"
								max="100"
								defaultValue="20"
								list="tickmarks"
								className="form-control"
							/>

							<datalist id="tickmarks">
								<option value="0" label="0%" />
								<option value="10" />
								<option value="20" />
								<option value="30" />
								<option value="40" />
								<option value="50" label="50%" />
								<option value="60" />
								<option value="70" />
								<option value="80" />
								<option value="90" />
								<option value="100" label="100%" />
							</datalist>

							<div className="invalid-feedback"></div>
						</div>

						<div className="form-group">
							<label>{__("ngrams_mode")}</label>
							<div className="form-check">
								<label className="form-check-label">
									<input
										ref="unigram"
										type="checkbox"
										id="classifier-unigram"
										name="unigram"
										defaultChecked={this.state.unigram}
										className="form-check-input"
									/>
									{__("unigram")}
								</label>
							</div>

							<div className="form-check">
								<label className="form-check-label">
									<input
										ref="bigram"
										type="checkbox"
										id="classifier-bigram"
										name="bigram"
										defaultChecked={this.state.bigram}
										className="form-check-input"
									/>
									{__("bigram")}
								</label>
							</div>

							<div className="form-check">
								<label className="form-check-label">
									<input
										ref="trigram"
										type="checkbox"
										id="classifier-trigram"
										name="trigram"
										defaultChecked={this.state.trigram}
										className="form-check-input"
									/>
									{__("trigram")}
								</label>
							</div>

							<div className="form-check">
								<label className="form-check-label">
									<input
										ref="chars4"
										type="checkbox"
										id="classifier-chars4"
										name="chars4"
										defaultChecked={this.state.chars4}
										className="form-check-input"
									/>
									{__("chars4")}
								</label>
							</div>
						</div>

						<details>
							<summary>{__("advanced")}</summary>

							<div className="form-group">
								<label htmlFor="classifier-c">{__("c")}</label>
								<input
									ref="c"
									type="text"
									id="classifier-c"
									name="c"
									className="form-control"
									defaultValue={this.state.c}
									required
								/>
								<div className="invalid-feedback"></div>
							</div>

							<div className="form-group">
								<label htmlFor="classifier-sigma">{__("sigma")}</label>
								<input
									ref="sigma"
									type="text"
									id="classifier-sigma"
									name="sigma"
									className="form-control"
									defaultValue={this.state.sigma}
									required
								/>
								<div className="invalid-feedback"></div>
							</div>

							<div className="form-group">
								<label htmlFor="classifier-sigma">{__("tolerance")}</label>
								<input
									ref="tol"
									type="text"
									id="classifier-tol"
									name="tol"
									className="form-control"
									defaultValue={this.state.tol}
									required
								/>
								<div className="invalid-feedback"></div>
							</div>
						</details>
					</form>

					: <Progress
						ref="progress"
						eta={true}
						lid={this.state.lid}
						origin={this.state.origin}
						stats={this.stage.bind(this)}
						end={this.ended.bind(this)} />
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
		let title = null

		if (!this.state.lid) {
			title = __("start_classifier")
		} else switch (this.state.stage) {
			case this.stages[0]: default: title = __("preparing_stage"); break
			case this.stages[1]: title = __("objective_stage"); break
			case this.stages[2]: title = __("sentiment_stage"); break
		}

		return <Modal ref="modal" title={title} content={this.form.bind(this)()} close={this.close.bind(this)} />
	}

}
