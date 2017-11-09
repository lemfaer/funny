import React, { Component } from "react"
import { Link } from "react-router-dom"

export default class Header extends Component {

	links() {
		let names = [ "Home", "Predict", "Parser", "Classifier", "Report" ]
		let links = [ "/", "/predict", "/parser", "/classifier", "/report" ]
		let current = this.props.current || "/"

		for (let i = 0; i < links.length; i++) {
			let url = links[i], name = names[i]
			let cls = "nav-item nav-link" + (url === current ? " active" : "")
			let replace = url === current ? true : false

			links[i] = (
				<Link key={i} to={url} className={cls} replace={replace}>
					<h5>{name}</h5>
				</Link>
			)
		}

		return links
	}

	render() {
		return (
			<nav className="navbar navbar-expand navbar-light bg-light">
				<div className="navbar-nav">
					{ this.links.bind(this)() }
				</div>
			</nav>
		)
	}

}
