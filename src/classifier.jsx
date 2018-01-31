import React, { Component } from "react"
import Classify from "./classify.jsx"
import Progress from "./progress.jsx"
import { salert } from "./alert.js"
import Header from "./header.jsx"
import Text from "./text.jsx"

export default class Classifier extends Component {

	constructor(props) {
		super(props)
		this.state = { "last" : null,"texts" : null }
	}

	componentDidMount() {
		document.title = __("classifier")
	}

	last(update) {
		if (this.state.last && !update) {
			return this.state.last
		}

		let xhr = new XMLHttpRequest()

		xhr.open("GET", "/api/launch/classifier/")
		xhr.onload = () => {
			if (xhr.readyState !== 4) {
				return
			}

			if (xhr.status === 200) {
				let json = xhr.responseText
				let last = JSON.parse(json)
				this.setState({ "last" : last })
			}
		}

		xhr.send()
		return null
	}

	texts(update) {
		if (this.state.texts && !update) {
			return this.state.texts
		}

		let xhr = new XMLHttpRequest()

		xhr.open("GET", "/api/texts/")
		xhr.onload = () => {
			if (xhr.readyState !== 4) {
				return
			}

			if (xhr.status === 200) {
				let json = xhr.responseText
				let texts = JSON.parse(json)
				this.setState({ "texts" : this.sort(texts) })
			}

			if (xhr.status !== 200) {
				salert(__("cant_load_texts"), false)
			}
		}

		xhr.send()
		return []
	}

	sort(texts) {
		function tsort(a, b) {
			let aid = parseInt(a.id)
			let bid = parseInt(b.id)
			return +(aid > bid) || +(aid === bid) - 1
		}

		let temp = texts.filter((text) => text.temp === "YES")
		let persist = texts.filter((text) => text.temp === "NO")

		temp.sort(tsort)
		persist.sort(tsort)

		return persist.concat(temp)
	}

	text(id) {
		for (let text of this.texts()) {
			if (text.id == id) {
				var txt  = text.text
				var cls  = text.class
				var temp = text.temp
				break
			}
		}

		this.refs.text.open(id, txt, cls, temp)
	}

	classify(id) {
		this.refs.classify.open(id, this.refs.progress)
	}

	gui() {
		let last = this.last()
		let running = last && !last.report

		return (
			<div>
				<button
					type="button"
					className="btn btn-light float-right my-3"
					onClick={this.text.bind(this)}>
						{__("add_text")}
				</button>

				<button
					type="button"
					className={"btn btn-warning float-right m-3 " + (running ? "bg-progress" : "")}
					onClick={this.classify.bind(this, running && last.id)}>
						{ running ? __("watch") : __("start") }
						{ !running ? "" :
							<Progress
								ref="progress"
								lid={last.id}
								eta={false}
								end={() => { this.refs.classify.close() }} />}
				</button>

				<button
					type="button"
					className="btn btn-light float-right my-3"
					onClick={this.texts.bind(this, true)}>
						<span className="octicon octicon-sync"></span>
				</button>
			</div>
		)
	}

	table() {
		return (
			<table className="table">
				<thead>
					<tr>
						<th>{__("num")}</th>
						<th>{__("text")}</th>
						<th>{__("class")}</th>
						<th>{__("edit")}</th>
					</tr>
				</thead>

				<tbody>
					{this.texts().map((text, index) => {
						return (
							<tr key={index} className={text.temp !== "YES" ? "table-warning" : ""}>
								<td>{text.id}</td>
								<td>{text.text.substr(0, 200) +
									(text.text.length > 200 ? "..." : "")}</td>
								<td>{text.class}</td>
								<td>
									<span
										className="octicon octicon-pencil"
										onClick={this.text.bind(this, text.id)}>
									</span>
								</td>
							</tr>
						)
					})}
				</tbody>
			</table>
		)
	}

	render() {
		return (
			<div>
				<Header current="/classifier" />
				<div className="container">
					<Text ref="text" />
					<Classify ref="classify" end={this.last.bind(this, true)} />
					{ this.gui.bind(this)() }
					{ this.table.bind(this)() }
				</div>
			</div>
		)
	}

}
