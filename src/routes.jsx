import React from "react"
import { HashRouter, Switch, Route } from "react-router-dom"

import Home from "./home.jsx"
import Parser from "./parser.jsx"
import Predict from "./predict.jsx"
import Classifier from "./classifier.jsx"
import Launches from "./launches.jsx"
import Report from "./report.jsx"

let routes = (
	<HashRouter>
		<Switch>
			<Route exact path="/" component={Home} />
			<Route path="/parser" component={Parser} />
			<Route path="/predict" component={Predict} />
			<Route path="/classifier" component={Classifier} />
			<Route path="/reports/:page?" component={Launches} />
			<Route path="/report/:id" component={Report} />
		</Switch>
	</HashRouter>
)

export { routes }
