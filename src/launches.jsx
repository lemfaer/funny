import React, { Component } from "react"
import { Link } from "react-router-dom"
import Bricklayer from "bricklayer"
import Header from "./header.jsx"
import Chart from "chart.js"

export default class Launches extends Component {

	constructor(props) {
		super(props)
		this.state = { "page" : 1, "launches" : null }
	}

	componentDidMount() {
		document.title = "Reports"
	}

	componentWillUpdate() {
		// remove old cascade grid
		this.bricklayer && this.bricklayer.destroy()
	}

	componentDidUpdate() {
		// create cascade grid
		this.bricklayer = new Bricklayer(this.refs.bricks)

		// create all charts
		for (let chart of document.getElementsByClassName("chart")) {
			let index = chart.dataset.index
			let report = JSON.parse(this.state.launches[index].report)

			let data = [
				report["total_normal_parsed"],
				report["total_positive_parsed"],
				report["total_negative_parsed"]
			]

			let chbar = new Chart(chart.getContext("2d"), {
				"type" : "bar",
				"data" : { 
					"labels" : [ "normal", "positive", "negative" ],
					"datasets" : [{
						"label" : "count",
						"data" : data,
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

			chart.classList.remove("d-none")
		}
	}

	launches(page, limit) {
		if (this.state.page === page && this.state.launches) {
			return this.state.launches
		}

		let xhr = new XMLHttpRequest()

		xhr.open("GET", sprintf("http://localhost/api/launches/%s,%s", limit, (page - 1) * limit))
		xhr.onload = () => {
			if (xhr.readyState !== 4) {
				return
			}

			if (xhr.status === 200) {
				let json = xhr.responseText
				let launches = JSON.parse(json)
				this.setState({
					"page" : page,
					"launches" : launches
				})
			}

			if (xhr.status !== 200) {
				// alert
			}
		}

		xhr.send()
		return []
	}

	card(launch, index) {
		let strings = {
			"empty" : "Not done yet",
			"parser" : [
				"Parser worked realy hard to get thoose %(total_parsed)d texts.",
				"Page loading is hard to do. Average loading time is near to %(average_time_loaded).2f seconds.",
				"We got rid of parsed texts with length less than %(minimum_text_length)d symbols.",
				"We spend a lot of time loading (%(total_time_loaded).2f s) and parsing (%(total_time_parsed).2f s) all pages.",
				"Original time estimated - %(original_estimate).2f seconds, real time - %(total_time).2f seconds.",
				"There is a %(total_normal_parsed)d new objective texts in classifier section.",
				"We've got %(total_positive_parsed)d new positive texts here =)",
				"Negative text count - %(total_negative_parsed)d"
			]
		};

		let short = []
		let report = JSON.parse(launch.report)
		let str = strings[launch.type]
		let chart = false

		if (report) {
			for (let ch of [ 1, .3, .1 ]) {
				if (Math.random() < ch) {
					let i = Math.floor(Math.random() * str.length)
					str[i] && short.push(vsprintf(str[i], report))
					delete str[i]
				}
			}

			if (Math.random() < .1) {
				chart = true
			}
		} else {
			short.push(strings["empty"])
		}

		return (
			<div className="card my-3 mx-2" key={index}>
				<div className={"card-header " + (launch.type === "parser" ? "bg-success" : "bg-primary")}>
					Launch #{launch.id}
				</div>

				<div className="card-body">
					{!chart ? "" : (
						<canvas className="chart d-none mb-2" data-index={index}></canvas>
					)}

					{short.map((string, index) => {
						return <p key={index} className="card-text mb-1">{string}</p>
					})}

					<Link to={"/report/" + launch.id} className="float-right">more...</Link>
				</div>
			</div>
		)
	}

	render() {
		let page, limit, launches

		limit = 10
		page = this.props.match.params.page
		page = (+page > 0 ? +page : 1)
		launches = this.launches(page, limit)

		return (
			<div>
				<Header current="/reports" />

				<div ref="bricks" className="bricklayer container pt-3">
					{launches.map(this.card.bind(this))}
				</div>

				<ul className="pagination justify-content-center">
					{page <= 1 ? "" : (
						<li className="page-item">
							<Link to={"/reports/" + (page - 1)} className="page-link">
								prev
							</Link>
						</li>
					)}

					{(!launches.length || launches.length < limit) ? "" : (
						<li className="page-item">
							<Link to={"/reports/" + (page + 1)} className="page-link">
								next
							</Link>
						</li>
					)}
				</ul>
			</div>
		)
	}

}
