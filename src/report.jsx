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
		document.title = sprintf(__("report_num"), this.id())
	}

	id() {
		return this.props.match.params.id
	}

	launch(id) {
		if (this.state.id === id && this.state.type) {
			return this.state
		}

		let xhr = new XMLHttpRequest()

		xhr.open("GET", sprintf("/api/launch/%d/", id))
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
				salert(__("cant_load_report"), false)
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
						{sprintf(__("launch_num"), this.id())}
					</h4>

					<div className="card-body float-right">
						<div className="col-8">
							<div>
								<h4 className="font-weight-normal">{__("general_col")}</h4>
								<dl className="row">
									<dt className="col-6">{__("launched")}</dt>
									<dd className="col-6">{ftdate(this.state.created)}</dd>

									<dt className="col-6">{__("progress")}</dt>
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
						{sprintf(__("launch_num"), this.id())}
					</h4>

					<div className="card-body float-right">
						<div className="col-8">
							<div>
								<h4 className="font-weight-normal">{__("general_col")}</h4>
								<dl className="row">
									<dt className="col-6">{__("launched")}</dt>
									<dd className="col-6">{ftdate(this.state.created)}</dd>

									<dt className="col-6">{__("progress")}</dt>
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
						{sprintf(__("launch_num"), this.id())}
					</h4>

					<div className="card-body float-right">
						<div className="col-4 float-right mb-2 d-none">
							<canvas ref="chart" width="1" height="1" data-type="texts2"></canvas>
						</div>

						<div className="col-8">
							<div>
								<h4 className="font-weight-normal">{__("general_col")}</h4>
								<dl className="row">
									<dt className="col-6">{__("total_pages_to_parse")}</dt>
									<dd className="col-6">{this.state.report.links.length}</dd>

									<dt className="col-6">{__("minimum_text_length")}</dt>
									<dd className="col-6">{this.state.report["minimum_text_length"]}</dd>

									<dt className="col-6">{__("launched")}</dt>
									<dd className="col-6">{ftdate(this.state.created)}</dd>

									<dt className="col-6">{__("ended")}</dt>
									<dd className="col-6">{ftdate(this.state.updated)}</dd>
								</dl>
							</div>

							<div>
								<h4 className="font-weight-normal">{__("total_col")}</h4>
								<dl className="row">
									<dt className="col-6">{__("texts")}</dt>
									<dd className="col-6">{this.state.report["total_parsed"]}</dd>

									<dt className="col-6">{__("estimated")}</dt>
									<dd className="col-6">{sprintf(__("format_float_seconds"), this.state.report["original_estimate"])}</dd>

									<dt className="col-6">{__("time")}</dt>
									<dd className="col-6">{sprintf(__("format_float_seconds"), this.state.report["total_time"])}</dd>
								</dl>
							</div>

							<div>
								<h4 className="font-weight-normal">{__("average_col")}</h4>
								<dl className="row">
									<dt className="col-6">{__("texts_per_page")}</dt>
									<dd className="col-6">{sprintf(__("format_float"), this.state.report["average_parsed"])}</dd>

									<dt className="col-6">{__("time")}</dt>
									<dd className="col-6">{sprintf(__("format_float_seconds"), this.state.report["average_time"])}</dd>
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
				// because this thing gets compiled
				switch (ngrams[key]) {
					case "unigram": rngrams.push(__("unigram")); break
					case "bigram": rngrams.push(__("bigram")); break
					case "trigram": rngrams.push(__("trigram")); break
					case "chars4": rngrams.push(__("chars4")); break
				}
			}
		}

		return (
			<div className="col-lg-10 col-12 mx-auto">
				<div className="report card">
					<h4 className="card-header font-weight-normal bg-primary">
						{sprintf(__("launch_num"), this.id())}
					</h4>

					<div className="card-body float-right">
						<div className="col-4 float-right mb-2 d-none">
							<canvas
								ref="chart1"
								width="1"
								height="1"
								data-type="data"
								data-index="0"
								data-label1={__("objective")}
								data-label2={__("subjective")}>
							</canvas>

							<canvas ref="chart2"
								width="1"
								height="1"
								data-type="data"
								data-index="1"
								data-label1={__("positive")}
								data-label2={__("negative")}>
							</canvas>
						</div>

						<div className="col-8">
							<div>
								<h4 className="font-weight-normal">{__("general_col")}</h4>
								<dl className="row">
									<dt className="col-6">{__("kernel")}</dt>
									<dd className="col-6">{(this.state.report["kernel"] === "linear" ? __("linear") : __("rbf"))}</dd>

									<dt className="col-6">{__("c_sigma_tol_iter_pass")}</dt>
									<dd className="col-6">{sprintf(__("c_sigma_tol_iter_pass_val"), this.state.report)}</dd>

									<dt className="col-6">{__("ngrams")}</dt>
									<dd className="col-6">{rngrams.join(", ")}</dd>

									<dt className="col-6">{__("launched")}</dt>
									<dd className="col-6">{ftdate(this.state.created)}</dd>

									<dt className="col-6">{__("ended")}</dt>
									<dd className="col-6">{ftdate(this.state.updated)}</dd>
								</dl>
							</div>

							<div>
								<h4 className="font-weight-normal">{__("preparations_col")}</h4>
								<dl className="row">
									<dt className="col-6">{__("texts")}</dt>
									<dd className="col-6">{this.state.report.prepare.texts}</dd>

									<dt className="col-6">{__("words")}</dt>
									<dd className="col-6">{this.state.report.prepare.total_words}</dd>

									<dt className="col-6">{__("estimated")}</dt>
									<dd className="col-6">{sprintf(__("format_float_seconds"), this.state.report.prepare.estimation)}</dd>

									<dt className="col-6">{__("time")}</dt>
									<dd className="col-6">{sprintf(__("format_float_seconds"), this.state.report.prepare.time)}</dd>
								</dl>
							</div>

							<div>
								<h4 className="font-weight-normal">{__("objectiveness_classifier_col")}</h4>
								<dl className="row">
									<dt className="col-6">{__("training_set_size")}</dt>
									<dd className="col-6">{this.state.report.objective.train.size}</dd>

									<dt className="col-6">{__("testing_set_size")}</dt>
									<dd className="col-6">{this.state.report.objective.test.size}</dd>

									<dt className="col-6">{__("performance")}</dt>
									<dd className="col-6">{sprintf(__("format_float_percent"), this.state.report.objective.test.perf * 100)}</dd>

									<dt className="col-6">{__("estimated")}</dt>
									<dd className="col-6">{sprintf(__("format_float_seconds"), this.state.report.objective.estimation)}</dd>

									<dt className="col-6">{__("time")}</dt>
									<dd className="col-6">{sprintf(__("format_float_seconds"), this.state.report.objective.train.time)}</dd>
								</dl>
							</div>

							<div>
								<h4 className="font-weight-normal">{__("positiveness_classifier_col")}</h4>
								<dl className="row">
									<dt className="col-6">{__("training_set_size")}</dt>
									<dd className="col-6">{this.state.report.sentiment.train.size}</dd>

									<dt className="col-6">{__("testing_set_size")}</dt>
									<dd className="col-6">{this.state.report.sentiment.test.size}</dd>

									<dt className="col-6">{__("performance")}</dt>
									<dd className="col-6">{sprintf(__("format_float_percent"), this.state.report.sentiment.test.perf * 100)}</dd>

									<dt className="col-6">{__("estimated")}</dt>
									<dd className="col-6">{sprintf(__("format_float_seconds"), this.state.report.sentiment.estimation)}</dd>

									<dt className="col-6">{__("time")}</dt>
									<dd className="col-6">{sprintf(__("format_float_seconds"), this.state.report.sentiment.train.time)}</dd>
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
							<th>{__("num")}</th>
							<th>{__("link")}</th>
							<th className="text-center">{__("texts")}</th>
							<th className="text-center">{__("loaded_parsed")}</th>
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
										{sprintf(__("format_float_seconds"), stats.loaded)} / {sprintf(__("format_float_seconds"), stats.parsed)}
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
					{[ __("positive_t"), __("negative_t"), __("objective_t"), __("subjective_t") ].map((name, index) => {
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
							<th>{__("num")}</th>
							<th>{__("word")}</th>
							<th>{__("delta_tf_idf")}</th>
						</tr>
					</thead>

					<tbody>
						{this.state.report[cl].top[i].map((word, index) => {
							return (
								<tr key={index}>
									<td>{index + 1}</td>
									<td>{word[0]}</td>
									<td>{sprintf(__("format_float"), word[1])}</td>
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
