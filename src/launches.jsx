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
		document.title = __("reports")
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

		xhr.open("GET", sprintf("/api/launches/%s,%s/", limit, (page - 1) * limit))
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
				salert(__("cant_load_launches"), false)
			}
		}

		xhr.send()
		return []
	}

	short(launch) {
		let charts = {
			"parser" : [ "texts" ],
			"classifier" : [ "stages", "perf" ],
			"follow" : [ "texts" ]
		}

		let strings = __("report_strings")
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
		let classnm = "card-header"
		let short = this.short(launch),
			strings = short[0],
			chart = short[1]

		if (launch.type === "parser") {
			classnm += " bg-success "
		}

		if (launch.type === "classifier") {
			classnm += " bg-primary "
		}

		if (launch.type === "follow") {
			classnm += " bg-warning "
		}

		return (
			<div className="card my-3 mx-2" key={index}>
				<div className={classnm}>
					{sprintf(__("launch_num"), launch.id)}
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

					<Link to={"/report/" + launch.id} className="float-right">{__("more")}</Link>
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
								{__("prev")}
							</Link>
						</li>
					)}

					{(!launches.length || launches.length < limit) ? "" : (
						<li className="page-item">
							<Link to={"/reports/" + (page + 1)} className="page-link">
								{__("next")}
							</Link>
						</li>
					)}
				</ul>
			</div>
		)
	}

}
