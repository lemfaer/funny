import React, { Component } from "react"
import Header from "./header.jsx"
import { ftdate } from "./fdate"
import Chart from "chart.js"

export default class Report extends Component {

	constructor(props) {
		super(props)
		this.state = {
			"id" : 0,
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
		if (this.state.id === id && this.state.report) {
			return this.state
		}

		let xhr = new XMLHttpRequest()

		xhr.open("GET", "http://localhost/api/launch/" + id)
		xhr.onload = () => {
			if (xhr.readyState !== 4) {
				return
			}

			if (xhr.status === 200) {
				let json = xhr.responseText
				let launch = JSON.parse(json)
				launch.report = JSON.parse(launch.report)
				this.setState(launch)
			}

			if (xhr.status !== 200) {
				// alert
			}
		}

		xhr.send()
		return {}
	}

	componentDidUpdate() {
		let chart = this.refs.chart

		if (!chart) {
			return
		}

		let chbar = new Chart(chart.getContext("2d"), {
			"type" : "pie",
			"data" : { 
				"labels" : [ "normal", "positive", "negative" ],

				"datasets" : [{
					"label" : "count",
					"data" : [
						this.state.report["total_normal_parsed"],
						this.state.report["total_positive_parsed"],
						this.state.report["total_negative_parsed"]
					],
					"backgroundColor" : [
						'rgba(255, 99, 132, 0.2)',
						'rgba(54, 162, 235, 0.2)',
						'rgba(255, 206, 86, 0.2)'
					],
					"borderColor" : [
						'rgba(255, 99, 132, 1)',
						'rgba(54, 162, 235, 1)',
						'rgba(255, 206, 86, 1)'
					],
					"borderWidth" : 1
				}]
			}
		})

		chart.parentNode.classList.remove("d-none")
	}

	parser() {
		return (
			<div className="col-lg-10 col-12 mx-auto">
				<div className="report card">
					<h4 className={"card-header font-weight-normal " +
							(this.state.type === "parser" ? "bg-success" : "bg-primary")}>
						Launch #{this.id()}
					</h4>

					<div className="card-body float-right">
						<div className="col-4 float-right mb-2 d-none">
							<canvas ref="chart" width="1" height="1"></canvas>
						</div>
						<div className="col-8">
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

							<h4 className="font-weight-normal">Total:</h4>
							<dl className="row">
								<dt className="col-6">Texts</dt>
								<dd className="col-6">{this.state.report["total_parsed"]}</dd>

								<dt className="col-6">Estimated</dt>
								<dd className="col-6">{sprintf("%.2fs", this.state.report["original_estimate"])}</dd>

								<dt className="col-6">Time</dt>
								<dd className="col-6">{sprintf("%.2fs", this.state.report["total_time"])}</dd>
							</dl>

							<h4 className="font-weight-normal">Average:</h4>
							<dl className="row">
								<dt className="col-6">Texts per page</dt>
								<dd className="col-6">{this.state.report["average_parsed"]}</dd>

								<dt className="col-6">Time</dt>
								<dd className="col-6">{sprintf("%.2fs", this.state.report["average_time"])}</dd>
							</dl>
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

	render() {
		let launch = this.launch(this.id())

		return (
			<div>
				<Header current="/reports" />
				<div className="container pt-4">
					{(launch && launch.type === "parser") ? this.parser() : ""}
					{(launch && launch.type === "parser") ? this.ptable() : ""}
				</div>
			</div>
		)
	}

}
