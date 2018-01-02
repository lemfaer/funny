import React, { Component } from "react"
import Progress from "./progress.jsx"
import { salert } from "./alert.js"
import Header from "./header.jsx"
import Parse from "./parse.jsx"
import Page from "./page.jsx"

export default class Parser extends Component {

	constructor(props) {
		super(props)
		this.state = { "last" : null, "pages" : null }
	}

	componentDidMount() {
		document.title = "Parser"
	}

	last(update) {
		if (this.state.last && !update) {
			return this.state.last
		}

		let xhr = new XMLHttpRequest()

		xhr.open("GET", "/api/launch/parser")
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

	pages(update) {
		if (this.state.pages && !update) {
			return this.state.pages
		}

		let xhr = new XMLHttpRequest()

		xhr.open("GET", "/api/pages")
		xhr.onload = () => {
			if (xhr.readyState !== 4) {
				return
			}

			if (xhr.status === 200) {
				let json = xhr.responseText
				let pages = JSON.parse(json)
				this.setState({ "pages" : pages })
			}

			if (xhr.status !== 200) {
				salert("Can't load pages", false)
			}
		}

		xhr.send()
		return []
	}

	page(id) {
		for (let page of this.pages()) {
			if (page.id == id) {
				var link = page.link
				break
			}
		}

		this.refs.page.open(id, link)
	}

	parse(id) {
		this.refs.parse.open(id, this.refs.progress)
	}

	gui() {
		let last = this.last()
		let running = last && !last.report

		return (
			<div>
				<button
					type="button"
					className="btn btn-light float-right my-3"
					onClick={this.page.bind(this)}>
						Add page
				</button>

				<button
					type="button"
					className={"btn btn-warning float-right m-3 " + (running ? "bg-progress" : "")}
					onClick={this.parse.bind(this, running && last.id)}>
						{ running ? "Watch" : "Start" }
						{ !running ? "" :
							<Progress
								ref="progress"
								lid={last.id}
								eta={false}
								start={new Date() / 1000}
								end={() => { this.refs.parse.closed() }} />}
				</button>

				<button
					type="button"
					className="btn btn-light float-right my-3"
					onClick={this.pages.bind(this, true)}>
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
						<th>#</th>
						<th>Link</th>
						<th>Edit</th>
					</tr>
				</thead>

				<tbody>
					{this.pages().map((page, index) => {
						return (
							<tr key={index}>
								<td>{page.id}</td>
								<td>
									<a href={decodeURI(page.link)}>
										{decodeURI(page.link)}
									</a>
								</td>
								<td>
									<span
										className="octicon octicon-pencil"
										onClick={this.page.bind(this, page.id, "test")}>
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
				<Header current="/parser" />
				<div className="container">
					<Page ref="page" />
					<Parse ref="parse" end={this.last.bind(this, true)} />
					{ this.gui.bind(this)() }
					{ this.table.bind(this)() }
				</div>
			</div>
		)
	}

}
