import React, { Component } from "react"
import { Link } from "react-router-dom"
import { salert } from "./alert.js"
import Bricklayer from "bricklayer"
import Header from "./header.jsx"
import { chart } from "./charts"

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
		for (let element of document.getElementsByClassName("chart")) {
			let type = element.dataset.type
			let index = element.dataset.index
			let report = JSON.parse(this.state.launches[index].report)
			chart(element, report, type)
		}
	}

	launches(page, limit) {
		if (this.state.page === page && this.state.launches) {
			return this.state.launches
		}

		let xhr = new XMLHttpRequest()

		xhr.open("GET", sprintf("/api/launches/%s,%s", limit, (page - 1) * limit))
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
				salert("Can't load launches", false)
			}
		}

		xhr.send()
		return []
	}

	short(launch) {
		let charts = {
			"parser" : [ "texts" ],
			"classifier" : [ "stages", "perf" ]
		}

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
			],

			"classifier" : [
				"Average text was split into %(prepare.average_words).2f words before algorithm start.",
				"Algorithm used %(objective.train.size)d texts for training objective/subjective recognition and %(objective.test.size)d for testing.",
				"Training set size of positive/negative classifier was %(sentiment.train.size)d texts, testing set - %(sentiment.test.size)d",
				"Classification efficiency: %(objective.test.perf).1f for objectiveness and %(sentiment.test.perf).1f for positiveness.",
				"Words used mostly in objective texts: %(objective.top[0][0][0])s, %(objective.top[0][1][0])s, %(objective.top[0][2][0])s.",
				"Those words are most common in subjective texts: %(objective.top[1][0][0])s, %(objective.top[1][1][0])s and %(objective.top[1][2][0])s.",
				"Top words used in positive texts: %(sentiment.top[0][0][0])s, %(sentiment.top[0][1][0])s and %(sentiment.top[0][2][0])s.",
				"Most unfavorable words were: %(sentiment.top[1][0][0])s, %(sentiment.top[1][1][0])s and %(sentiment.top[1][2][0])s."
			]
		}

		let string = []
		let report = JSON.parse(launch.report)
		let chart = null

		if (report) {
			charts = charts[launch.type]
			strings = strings[launch.type]

			for (let ch of [ 1, .3, .1 ]) {
				if (Math.random() < ch) {
					let i = Math.floor(Math.random() * strings.length)
					strings[i] && string.push(vsprintf(strings[i], report))
					delete strings[i]
				}
			}

			string.sort((a, b) => {
				return a.length - b.length
			})

			if (Math.random() < .1) {
				let i = Math.floor(Math.random() * charts.length)
				charts[i] && (chart = charts[i])
			}
		} else {
			string.push(strings["empty"])
		}

		return [ string, chart ]
	}

	card(launch, index) {
		var short = this.short(launch),
			strings = short[0],
			chart = short[1]

		return (
			<div className="card my-3 mx-2" key={index}>
				<div className={"card-header " + (launch.type === "parser" ? "bg-success" : "bg-primary")}>
					Launch #{launch.id}
				</div>

				<div className="card-body">
					{!chart ? "" : (
						<canvas
							className="chart d-none mb-2"
							data-index={index}
							data-type={chart}>
						</canvas>
					)}

					{strings.map((string, index) => {
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
