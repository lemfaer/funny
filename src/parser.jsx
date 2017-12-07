import React, { Component } from "react"
import Header from "./header.jsx"
import Page from "./page.jsx"

export default class Parser extends Component {

	constructor(props) {
		super(props)
		this.state = { "pages" : null }
	}

	componentDidMount() {
		document.title = "Parser"
	}

	pages(update) {
		if (this.state.pages && !update) {
			return this.state.pages
		}

		let xhr = new XMLHttpRequest()

		xhr.open("GET", "http://localhost/api/pages")
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
				// alert
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

		this.refs.page.toggle(id, link)
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
					<button type="button" className="btn btn-light float-right my-3" onClick={this.page.bind(this)}>Add page</button>
					<button type="button" className="btn btn-warning float-right m-3" onClick={this.start.bind(this)}>Start</button>
					<button type="button" className="btn btn-light float-right my-3" onClick={this.pages.bind(this, true)}>
						<span className="octicon octicon-sync"></span>
					</button>
					{ this.table.bind(this)() }
				</div>
			</div>
		)
	}

}
