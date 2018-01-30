import React, { Component } from "react"
import { texts2_chart, data_chart } from "./charts"
import { ngrams } from "../config.json"
import Progress from "./progress.jsx"
import { salert } from "./alert.js"
import Header from "./header.jsx"
import { ftdate } from "./fdate"

export default class Report extends Component {

	constructor(props) {
		super(props)
		this.state = {
			"id" : 0,
			"tab" : Math.floor(Math.random() * 4),
			"type" : null,
			"report" : null,
			"created" : null,
			"updated" : null
		}
	}

	componentDidMount() {
		document.title = "Report #" + this.id()
	}

	id() {
		return this.props.match.params.id
	}

	launch(id) {
		if (this.state.id === id && this.state.type) {
			return this.state
		}

		let xhr = new XMLHttpRequest()

		xhr.open("GET", "/api/launch/" + id)
		xhr.onload = () => {
			if (xhr.readyState !== 4) {
				return
			}

			if (xhr.status === 200) {
				let json = xhr.responseText
				let launch = JSON.parse(json)

				if (launch.report) {
					launch.report = JSON.parse(launch.report)
				}

				for (let i in launch.weights || []) {
					launch.weights[i].data = JSON.parse(launch.weights[i].data)
					launch.weights[i].alpha = JSON.parse(launch.weights[i].alpha)
				}

				this.setState(launch)
			}

			if (xhr.status !== 200) {
				salert("Can't load report", false)
			}
		}

		xhr.send()
		return {}
	}

	componentDidUpdate() {
		if (this.refs.chart) {
			texts2_chart(this.refs.chart, this.state.report)
		}

		if (this.refs.chart1) {
			data_chart(this.refs.chart1, this.state.weights[this.refs.chart1.dataset.index],
				[ this.refs.chart1.dataset.label1, this.refs.chart1.dataset.label2 ])
		}

		if (this.refs.chart2) {
			data_chart(this.refs.chart2, this.state.weights[this.refs.chart2.dataset.index],
				[ this.refs.chart2.dataset.label1, this.refs.chart2.dataset.label2 ])
		}
	}

	parsing() {
		return (
			<div className="col-lg-10 col-12 mx-auto">
				<div className="report card">
					<h4 className="card-header font-weight-normal bg-success">
						Launch #{this.id()}
					</h4>

					<div className="card-body float-right">
						<div className="col-8">
							<div>
								<h4 className="font-weight-normal">General:</h4>
								<dl className="row">
									<dt className="col-6">Launched</dt>
									<dd className="col-6">{ftdate(this.state.created)}</dd>

									<dt className="col-6">Progress</dt>
									<dd className="col-6">
										<Progress
											ref="progress"
											lid={this.state.id}
											end={() => this.refs.progress.state.watch && this.setState({ "id" : 0 })}
											eta={true} />
									</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	training() {
		return (
			<div className="col-lg-10 col-12 mx-auto">
				<div className="report card">
					<h4 className="card-header font-weight-normal bg-primary">
						Launch #{this.id()}
					</h4>

					<div className="card-body float-right">
						<div className="col-8">
							<div>
								<h4 className="font-weight-normal">General:</h4>
								<dl className="row">
									<dt className="col-6">Launched</dt>
									<dd className="col-6">{ftdate(this.state.created)}</dd>

									<dt className="col-6">Progress</dt>
									<dd className="col-6">
										<Progress
											ref="progress"
											lid={this.state.id}
											end={() => this.refs.progress.state.watch && this.setState({ "id" : 0 })}
											eta={true} />
									</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	parsed() {
		return (
			<div className="col-lg-10 col-12 mx-auto">
				<div className="report card">
					<h4 className="card-header font-weight-normal bg-success">
						Launch #{this.id()}
					</h4>

					<div className="card-body float-right">
						<div className="col-4 float-right mb-2 d-none">
							<canvas ref="chart" width="1" height="1" data-type="texts2"></canvas>
						</div>

						<div className="col-8">
							<div>
								<h4 className="font-weight-normal">General:</h4>
								<dl className="row">
									<dt className="col-6">Total pages to parse</dt>
									<dd className="col-6">{this.state.report.links.length}</dd>

									<dt className="col-6">Minimum text length</dt>
									<dd className="col-6">{this.state.report["minimum_text_length"]}</dd>

									<dt className="col-6">Launched</dt>
									<dd className="col-6">{ftdate(this.state.created)}</dd>

									<dt className="col-6">Ended</dt>
									<dd className="col-6">{ftdate(this.state.updated)}</dd>
								</dl>
							</div>

							<div>
								<h4 className="font-weight-normal">Total:</h4>
								<dl className="row">
									<dt className="col-6">Texts</dt>
									<dd className="col-6">{this.state.report["total_parsed"]}</dd>

									<dt className="col-6">Estimated</dt>
									<dd className="col-6">{sprintf("%.2fs", this.state.report["original_estimate"])}</dd>

									<dt className="col-6">Time</dt>
									<dd className="col-6">{sprintf("%.2fs", this.state.report["total_time"])}</dd>
								</dl>
							</div>

							<div>
								<h4 className="font-weight-normal">Average:</h4>
								<dl className="row">
									<dt className="col-6">Texts per page</dt>
									<dd className="col-6">{sprintf("%.2f", this.state.report["average_parsed"])}</dd>

									<dt className="col-6">Time</dt>
									<dd className="col-6">{sprintf("%.2fs", this.state.report["average_time"])}</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	trained() {
		let rngrams = []
		let tngrams = +this.state.report["ngrams"]

		for (let key in ngrams) {
			if (tngrams & key) {
				rngrams.push(ngrams[key])
			}
		}

		return (
			<div className="col-lg-10 col-12 mx-auto">
				<div className="report card">
					<h4 className="card-header font-weight-normal bg-primary">
						Launch #{this.id()}
					</h4>

					<div className="card-body float-right">
						<div className="col-4 float-right mb-2 d-none">
							<canvas
								ref="chart1"
								width="1"
								height="1"
								data-type="data"
								data-index="0"
								data-label1="objective"
								data-label2="subjective">
							</canvas>

							<canvas ref="chart2"
								width="1"
								height="1"
								data-type="data"
								data-index="1"
								data-label1="positive"
								data-label2="negative">
							</canvas>
						</div>

						<div className="col-8">
							<div>
								<h4 className="font-weight-normal">General:</h4>
								<dl className="row">
									<dt className="col-6">Kernel</dt>
									<dd className="col-6">{this.state.report["kernel"]}</dd>

									<dt className="col-6">C / sigma / tol / iter / pass</dt>
									<dd className="col-6">{sprintf("%(c).2f / %(sigma).2f / %(tol)f / %(liter)d / %(lpass)d", this.state.report)}</dd>

									<dt className="col-6">Ngrams</dt>
									<dd className="col-6">{rngrams.join(", ")}</dd>

									<dt className="col-6">Launched</dt>
									<dd className="col-6">{ftdate(this.state.created)}</dd>

									<dt className="col-6">Ended</dt>
									<dd className="col-6">{ftdate(this.state.updated)}</dd>
								</dl>
							</div>

							<div>
								<h4 className="font-weight-normal">Preparations:</h4>
								<dl className="row">
									<dt className="col-6">Texts</dt>
									<dd className="col-6">{this.state.report.prepare.texts}</dd>

									<dt className="col-6">Words</dt>
									<dd className="col-6">{this.state.report.prepare.total_words}</dd>

									<dt className="col-6">Estimated</dt>
									<dd className="col-6">{sprintf("%.2fs", this.state.report.prepare.estimation)}</dd>

									<dt className="col-6">Time</dt>
									<dd className="col-6">{sprintf("%.2fs", this.state.report.prepare.time)}</dd>
								</dl>
							</div>

							<div>
								<h4 className="font-weight-normal">Objectiveness classifier:</h4>
								<dl className="row">
									<dt className="col-6">Training set size</dt>
									<dd className="col-6">{this.state.report.objective.train.size}</dd>

									<dt className="col-6">Testing set size</dt>
									<dd className="col-6">{this.state.report.objective.test.size}</dd>

									<dt className="col-6">Performance</dt>
									<dd className="col-6">{sprintf("%.2f%%", this.state.report.objective.test.perf * 100)}</dd>

									<dt className="col-6">Estimated</dt>
									<dd className="col-6">{sprintf("%.2fs", this.state.report.objective.estimation)}</dd>

									<dt className="col-6">Time</dt>
									<dd className="col-6">{sprintf("%.2fs", this.state.report.objective.train.time)}</dd>
								</dl>
							</div>

							<div>
								<h4 className="font-weight-normal">Positiveness classifier:</h4>
								<dl className="row">
									<dt className="col-6">Training set size</dt>
									<dd className="col-6">{this.state.report.sentiment.train.size}</dd>

									<dt className="col-6">Testing set size</dt>
									<dd className="col-6">{this.state.report.sentiment.test.size}</dd>

									<dt className="col-6">Performance</dt>
									<dd className="col-6">{sprintf("%.2f%%", this.state.report.sentiment.test.perf * 100)}</dd>

									<dt className="col-6">Estimated</dt>
									<dd className="col-6">{sprintf("%.2fs", this.state.report.sentiment.estimation)}</dd>

									<dt className="col-6">Time</dt>
									<dd className="col-6">{sprintf("%.2fs", this.state.report.sentiment.train.time)}</dd>
								</dl>
							</div>
						</div>
					</div>
				</div>
			</div>
		)
	}

	ptable() {
		return (
			<div className="col-lg-10 col-12 mt-3 mx-auto">
				<table className="table">
					<thead>
						<tr>
							<th>#</th>
							<th>Link</th>
							<th className="text-center">Texts</th>
							<th className="text-center">Loaded / Parsed</th>
						</tr>
					</thead>

					<tbody>
						{this.state.report.links.map((stats, index) => {
							return (
								<tr key={index}>
									<td>{index + 1}</td>
									<td>
										<a href={decodeURI(stats.link)}>
											{decodeURI(stats.link)}
										</a>
									</td>
									<td className="text-center">{stats.count.all}</td>
									<td className="text-center">
										{sprintf("%.2fs", stats.loaded)} / {sprintf("%.2fs", stats.parsed)}
									</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
		)
	}

	ctable() {
		let i  = (this.state.tab & (1 << 0))
		let cl = (this.state.tab & (1 << 1) ? "objective" : "sentiment")

		return (
			<div className="col-lg-10 col-12 mt-3 mx-auto">
				<ul className="pagination justify-content-center">
					{[ "Positive", "Negative", "Objective", "Subjective" ].map((name, index) => {
						return (
							<li className="page-item">
								<button
									data-tab={index}
									className={"page-link" + (this.state.tab === index ? " active" : "")}
									onClick={(ev) => this.setState({ "tab" : +ev.target.dataset.tab })}>
										{name}
								</button>
							</li>
						)
					})}
				</ul>

				<table className="table">
					<thead>
						<tr>
							<th>#</th>
							<th>Word</th>
							<th>Delta TF-IDF</th>
						</tr>
					</thead>

					<tbody>
						{this.state.report[cl].top[i].map((word, index) => {
							return (
								<tr key={index}>
									<td>{index + 1}</td>
									<td>{word[0]}</td>
									<td>{sprintf("%.2f", word[1])}</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
		)
	}

	render() {
		let launch = this.launch(this.id())

		return (
			<div>
				<Header current="/reports" />
				<div className="container pt-4">
					{(launch && launch.type === "parser" && !launch.report) ? this.parsing() : ""}
					{(launch && launch.type === "parser" && launch.report) ? this.parsed() : ""}
					{(launch && launch.type === "parser" && launch.report) ? this.ptable() : ""}
					{(launch && launch.type === "classifier" && !launch.report) ? this.training() : ""}
					{(launch && launch.type === "classifier" && launch.report) ? this.trained() : ""}
					{(launch && launch.type === "classifier" && launch.report) ? this.ctable() : ""}
				</div>
			</div>
		)
	}

}
