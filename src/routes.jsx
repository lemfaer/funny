import React from "react"
import { HashRouter, Switch, Route } from "react-router-dom"
import Parser from "./parser.jsx"
import Home from "./home.jsx"

let routes = (
	<HashRouter>
		<Switch>
			<Route exact path="/" component={Home}></Route>
			<Route path="/parser" component={Parser}></Route>
		</Switch>
	</HashRouter>
)

export { routes }
