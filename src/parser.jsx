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
		document.title = __("parser")
	}

	last(update) {
		if (this.state.last && !update) {
			return this.state.last
		}

		let xhr = new XMLHttpRequest()

		xhr.open("GET", "/api/launch/parser/")
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

		xhr.open("GET", "/api/pages/")
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
				salert(__("cant_load_pages"), false)
			}
		}

		xhr.send()
		return []
	}

	page(id) {
		for (let page of this.pages()) {
			if (page.id == id) {
				var link = page.link
				var recurrence = page.recurrence
				break
			}
		}

		this.refs.page.open(id, link, recurrence)
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
						{__("add_page")}
				</button>

				<button
					type="button"
					className={"btn btn-warning float-right m-3 " + (running ? "bg-progress" : "")}
					onClick={this.parse.bind(this, running && last.id)}>
						{ running ? __("watch") : __("start") }
						{ !running ? "" :
							<Progress
								ref="progress"
								lid={last.id}
								eta={false}
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
		let recurrences = {
			"none" : __("none"),
			"weekly" : __("weekly"),
			"bi-weekly" : __("bi-weekly"),
			"monthly" : __("monthly")
		}

		return (
			<table className="table">
				<thead>
					<tr>
						<th>{__("num")}</th>
						<th>{__("link")}</th>
						<th>{__("follow")}</th>
						<th>{__("edit")}</th>
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
								<td>{recurrences[page.recurrence || 'none']}</td>
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
