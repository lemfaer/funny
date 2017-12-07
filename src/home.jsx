import React, { Component } from "react"
import { Link } from "react-router-dom"
import ReactDOM from "react-dom"

export default class Home extends Component {

	componentDidMount() {
		document.title = "Home page"
		document.body.classList.add("h-100")
		document.documentElement.classList.add("h-100")
		ReactDOM.findDOMNode(this).parentNode.classList.add("h-100")
	}

	componentWillUnmount() {
		document.body.classList.remove("h-100")
		document.documentElement.classList.remove("h-100")
		ReactDOM.findDOMNode(this).parentNode.classList.remove("h-100")
	}

	render() {
		return (
			<nav className="h-100">
				<Link to="/predict" className="btn col-6 quarter"><h1>Predict</h1></Link>
				<Link to="/parser" className="btn col-6 quarter"><h1>Parser</h1></Link>
				<Link to="/classifier" className="btn col-6 quarter"><h1>Classifier</h1></Link>
				<Link to="/reports" className="btn col-6 quarter"><h1>Reports</h1></Link>
			</nav>
		)
	}

}
