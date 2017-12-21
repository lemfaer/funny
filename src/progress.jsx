import React, { Component } from "react"

export default class Progress extends Component {

	constructor(props) {
		super(props)
		this.state = {
			"gone" : 0,
			"eta" : -1,
			"stats" : 0,
			"delay" : 0,
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

		xhr.open("GET", "http://localhost/api/eta/" + this.props.lid)
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

			// alert
		}

		xhr.send()
	}

	watch(stats) {
		var eta, time, delay, tick
		clearInterval(this.state.tick)

		if (!stats || +stats.eta) {
			eta   = (stats ? +stats.eta  : -1) * 1000
			time  = (stats ? +stats.time : -1) * 1000
			delay = (stats ? Math.max(this.state.delay, time) : 100)
			delay = (stats && stats.id === this.state.stats ? this.state.delay : delay)

			setTimeout(this.load.bind(this), delay)
			tick = setInterval(this.tick.bind(this), this.state.tickin)
			this.setState({ "eta" : eta, "stats" : stats, "delay" : delay, "tick" : tick, "tickout" : 0 })
			return
		}

		this.setState({ "eta" : 0, "percent" : 100 })
		this.props.end()
		// alert
	}

	tick() {
		let gone = this.state.gone + this.state.tickin
		let tick = this.state.tickout + this.state.tickin
		let percent = gone / (gone - tick + this.state.eta) * 100
		this.setState({ "gone" : gone, "percent" : percent, "tickout" : tick })
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
