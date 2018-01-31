import Chart from "chart.js"

function chart(element, report, type) {
	switch (type) {
		case "texts": texts_chart(element, report); break
		case "texts2": texts2_chart(element, report); break
		case "stages": stages_chart(element, report); break
		case "perf" : perf_chart(element, report); break
	}
}

function texts_chart(element, report) {
	var data = [
		report["total_normal_parsed"],
		report["total_positive_parsed"],
		report["total_negative_parsed"]
	]

	var chbar = new Chart(element.getContext("2d"), {
		"type" : "bar",

		"data" : { 
			"labels" : [ __("normal"), __("positive"), __("negative") ],
			"datasets" : [{
				"data" : data,

				"backgroundColor" : [
					'rgba(255, 99, 132, 0.2)',
					'rgba(54, 162, 235, 0.2)',
					'rgba(255, 206, 86, 0.2)'
				],

				"borderColor" : [
					'rgba(255, 99, 132, 1)',
					'rgba(54, 162, 235, 1)',
					'rgba(255, 206, 86, 1)'
				],

				"borderWidth" : 1
			}]
		},

		"options" : {
			"title" : {
				"text" : __("texts_count"),
				"display" : true
			},

			"legend" : {
				"display" : false
			}
		}
	})

	element.classList.remove("d-none")
}

function texts2_chart(element, report) {
	var data = [
		report["total_normal_parsed"],
		report["total_positive_parsed"],
		report["total_negative_parsed"]
	]

	var chbar = new Chart(element.getContext("2d"), {
		"type" : "pie",
		"data" : { 
			"labels" : [ __("normal"), __("positive"), __("negative") ],

			"datasets" : [{
				"label" : __("count"),
				"data" : data,

				"backgroundColor" : [
					'rgba(255, 99, 132, 0.2)',
					'rgba(54, 162, 235, 0.2)',
					'rgba(255, 206, 86, 0.2)'
				],

				"borderColor" : [
					'rgba(255, 99, 132, 1)',
					'rgba(54, 162, 235, 1)',
					'rgba(255, 206, 86, 1)'
				],

				"borderWidth" : 1
			}]
		}
	})

	element.parentNode.classList.remove("d-none")
}

function stages_chart(element, report) {
	var data = [
		report["prepare"]["time"],
		report["objective"]["time"],
		report["sentiment"]["time"]
	]

	var chbar = new Chart(element.getContext("2d"), {
		"type" : "bar",

		"data" : { 
			"labels" : [ __("prepare"), __("objective"), __("sentiment") ],
			"datasets" : [{
				"data" : data,

				"backgroundColor" : [
					'rgba(255, 99, 132, 0.2)',
					'rgba(54, 162, 235, 0.2)',
					'rgba(255, 206, 86, 0.2)'
				],

				"borderColor" : [
					'rgba(255, 99, 132, 1)',
					'rgba(54, 162, 235, 1)',
					'rgba(255, 206, 86, 1)'
				],

				"borderWidth" : 1
			}]
		},

		"options" : {
			"title" : {
				"text" : __("time_for_each_stage"),
				"display" : true
			},

			"legend" : {
				"display" : false
			},

			"tooltips" : {
				"callbacks" : {
					"label" : function(item, data) {
						return sprintf(__("format_float_seconds"), item.yLabel)
					}
				}
			}
		}
	})

	element.classList.remove("d-none")
}

function perf_chart(element, report) {
	var data = [
		report["objective"]["test"]["perf"] * 100,
		report["sentiment"]["test"]["perf"] * 100
	]

	var chbar = new Chart(element.getContext("2d"), {
		"type" : "bar",

		"data" : { 
			"labels" : [ __("objective"), __("sentiment") ],
			"datasets" : [{
				"data" : data,

				"backgroundColor" : [
					'rgba(255, 99, 132, 0.2)',
					'rgba(54, 162, 235, 0.2)'
				],

				"borderColor" : [
					'rgba(255, 99, 132, 1)',
					'rgba(54, 162, 235, 1)'
				],

				"borderWidth" : 1
			}]
		},

		"options" : {
			"title" : {
				"text" : __("classification_performance"),
				"display" : true
			},

			"legend" : {
				"display" : false
			},

			"tooltips" : {
				"callbacks" : {
					"label" : function(item, data) {
						var i = item.index
						var j = item.datasetIndex
						var data = data.datasets[j].data[i]
						return sprintf(__("format_int_percent"), data)
					}
				}
			},

			"scales" : {
				"yAxes": [{
					"ticks": {
						"min" : 0,
						"max" : 100
					}
				}]
			}
		}
	})

	element.classList.remove("d-none")
}

function data_chart(element, weights, labels) {
	var buffer = []
	var data = [ [], [] ]
	var weights = weights.data
	var numsort = function (a, b) { return a - b }
	var numsort2 = function (a, b) { return a[0] - b[0] }

	for (var i in weights) {
		var j = +(weights[i][1] < 0)
		data[j].push(+weights[i][0][0])
	}

	for (var i in data) {
		data[i].sort(numsort)
		i == 0 && data[i].reverse()

		for (var j in data[i]) {
			var d = Math.round(data[i][j])
			var l = Math.round(100 - 100 * j / data[i].length)

			if (l % 10 == 0 || l < 5) {
				buffer.push([ d, l, i ])
			}
		}
	}

	var x = []
	var y = [ [], [] ]
	buffer.sort(numsort2)

	for (var i in buffer) {
		var j = +buffer[i][2]
		x.push(buffer[i][0])
		y[j].push(buffer[i][1])
		y[+!j].push(NaN)
	}

	var chbar = new Chart(element.getContext("2d"), {
		"type" : "line",

		"data" : {
			"labels" : x,
			"datasets" : [
				{
					"label" : labels[0],
					"data" : y[0],
					"backgroundColor" : "rgba(255, 99, 132, 0.2)",
					"borderColor" : "rgba(255, 99, 132, 1)",
					"borderWidth" : 1
				},

				{
					"label" : labels[1],
					"data" : y[1],
					"backgroundColor" : "rgba(54, 162, 235, 0.2)",
					"borderColor" : "rgba(54, 162, 235, 1)",
					"borderWidth" : 1
				}
			]
		},

		"options" : {
			scales: {
				yAxes: [{
					stacked: true
				}],

				xAxes: [{
					stacked: true
				}]
			}
		}
	})

	element.parentNode.classList.remove("d-none")
}

export {
	chart,
	texts_chart,
	texts2_chart,
	stages_chart,
	perf_chart,
	data_chart
}
