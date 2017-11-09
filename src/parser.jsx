import React, { Component } from "react"
import ReactDOM from "react-dom"
import Header from "./header.jsx"

export default class Parser extends Component {

	componentDidMount() {
		document.title = "Parser"
	}

	pages() {
		return [
			{
				id : 1,
				link : "test",
				type : 1
			},

			{
				id : 2,
				link : "test 2",
				type : 2
			}
		]
	}

	table() {
		return (
			<table className="table">
				<thead>
					<tr>
						<th>#</th>
						<th>Link</th>
						<th>Type</th>
					</tr>
				</thead>

				<tbody>
					{this.pages().map((page, index) => {
						return (
							<tr key={index}>
								<td>{page.id}</td>
								<td>{page.link}</td>
								<td>{page.type}</td>
							</tr>
						)
					})}
				</tbody>
			</table>
		)
	}

	render() {
		return (
			<div className="container">
				<Header current="/parser" />
				<button type="button" className="btn btn-light float-right my-3">Add page</button>
				<button type="button" className="btn btn-warning float-right m-3">Start</button>
				{ this.table.bind(this)() }
			</div>
		)
	}

}
