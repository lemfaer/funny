import React, { Component } from "react"
import Header from "./header.jsx"
import Text from "./text.jsx"

export default class Classifier extends Component {

	constructor(props) {
		super(props)
		this.state = { "texts" : null }
	}

	componentDidMount() {
		document.title = "Classifier"
	}

	texts(update) {
		if (this.state.texts && !update) {
			return this.state.texts
		}

		let xhr = new XMLHttpRequest()

		xhr.open("GET", "http://localhost/api/texts")
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
				// alert
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

		this.refs.text.toggle(id, txt, cls, temp)
	}

	start() {
		console.log("start")
	}

	table() {
		return (
			<table className="table">
				<thead>
					<tr>
						<th>#</th>
						<th>Text</th>
						<th>Class</th>
						<th>Edit</th>
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
										onClick={this.text.bind(this, text.id, "test")}>
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
					<button type="button" className="btn btn-light float-right my-3" onClick={this.text.bind(this)}>Add text</button>
					<button type="button" className="btn btn-warning float-right m-3" onClick={this.start.bind(this)}>Start</button>
					<button type="button" className="btn btn-light float-right my-3" onClick={this.texts.bind(this, true)}>
						<span className="octicon octicon-sync"></span>
					</button>
					{ this.table.bind(this)() }
				</div>
			</div>
		)
	}

}
