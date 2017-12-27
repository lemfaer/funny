import React, { Component } from "react"
import { salert } from "./alert.js"

export default class Progress extends Component {

	constructor(props) {
		super(props)
		this.state = {
			"eta" : -1000,
			"stats" : 0,
			"watch" : 10,
			"delay" : 0,
			"gone" : 0,
			"tick" : null,
			"tickin" : 100,
			"tickout" : 0,
			"percent" : 0
		}
	}

	componentDidMount() {
		this.watch()
	}

	load() {
		let xhr = new XMLHttpRequest()

		xhr.open("GET", "/api/eta/" + this.props.lid)
		xhr.onload = () => {
			if (xhr.readyState !== 4) {
				return
			}

			if (xhr.status === 200) {
				let json = xhr.responseText
				let stats = JSON.parse(json)
				this.watch(stats)
				return
			}

			if (xhr.status === 404) {
				this.watch()
				return
			}
		}

		xhr.send()
	}

	watch(stats) {
		clearInterval(this.state.tick)

		if (this.state.watch === 0) {
			salert("Process error", false)
		}

		if (!this.state.watch) {
			return
		}

		if (!stats || +stats.eta) {
			let eta   = (stats ? +stats.eta  : -1) * 1000
			let time1 = (stats ? +stats.time : -1) * 1000
			let time2 = (stats ? eta * .15   : -1  * 1000)
			let delay = (stats ? Math.max(this.state.delay, time1, time2) : 500)
			let watch = (!stats || stats.id === this.state.stats ? this.state.watch - 1 : 10)

			setTimeout(this.load.bind(this), delay)
			let tick = setInterval(this.tick.bind(this), this.state.tickin)
			this.setState({ "eta" : eta, "stats" : stats, "delay" : delay, "watch" : watch, "tick" : tick, "tickout" : 0 })
			return
		}


		this.setState({ "eta" : 0, "percent" : 100 })
		salert(sprintf("Process #%d ended", this.props.lid), true)
		this.props.end()
	}

	tick() {
		let gone = this.state.gone + this.state.tickin
		let tick = this.state.tickout + this.state.tickin
		let percent = 100 * (this.state.eta > 0 ? gone / (gone - tick + this.state.eta) : 0)
		this.setState({ "gone" : gone, "percent" : percent, "tickout" : tick })
	}

	clear() {
		clearInterval(this.state.tick)
		this.setState({ "watch" : false })
	}

	render() {
		return (
			<div>
			<div className="progress">
				<div 
					className="progress-bar progress-bar-striped progress-bar-animated bg-warning"
					style={{ "width" : this.state.percent + "%" }}
					/>
			</div>

			{!this.props.eta ? "" :
				<div className="d-flex justify-content-center mt-2">
					<span className="h5 font-weight-normal">eta: {sprintf("%.2f", this.state.eta / 1000)}</span>
				</div>}
			</div>
		)
	}

}
