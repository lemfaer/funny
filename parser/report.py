from db import *

def create_report(cnx, lid, ll, stats, top5, top30):
	if not stats:
		return

	rtime     = [ s["time"]   for s in stats ]
	loaded    = [ s["loaded"] for s in stats ]
	parsed    = [ s["parsed"] for s in stats ]
	predicted = [ s["predicted"] for s in stats ]
	texts     = [ s["count"]["all"] for s in stats ]
	normal    = [ s["count"]["normal"] for s in stats ]
	positive  = [ s["count"]["positive"] for s in stats ]
	negative  = [ s["count"]["negative"] for s in stats ]

	minimum_text_length = ll
	original_estimate = stats[0]["eta"] + stats[0]["time"]
	total_normal_parsed = sum(normal)
	total_positive_parsed = sum(positive)
	total_negative_parsed = sum(negative)
	total_parsed = sum(texts)
	total_time_predicted = sum(loaded)
	total_time_loaded = sum(loaded)
	total_time_parsed = sum(parsed)
	total_time = sum(rtime)
	average_parsed = sum(texts) / len(texts)
	average_time_loaded = sum(loaded) / len(stats)
	average_time_parsed = sum(parsed) / len(stats)
	average_time_predicted = sum(predicted) / len(stats)
	average_time = sum(rtime) / len(stats)

	update_launch(cnx, lid, {
		"minimum_text_length" : minimum_text_length,
		"original_estimate" : original_estimate,

		"total_normal_parsed" : total_normal_parsed,
		"total_positive_parsed" : total_positive_parsed,
		"total_negative_parsed" : total_negative_parsed,
		"total_parsed" : total_parsed,
		"total_time_loaded" : total_time_loaded,
		"total_time_predicted" : total_time_predicted,
		"total_time_parsed" : total_time_parsed,
		"total_time" : total_time,

		"average_parsed" : average_parsed,
		"average_time_loaded" : average_time_loaded,
		"average_time_predicted" : average_time_predicted,
		"average_time_parsed" : average_time_parsed,
		"average_time" : average_time,

		"links" : stats,
		"top30" : top30,
		"top5" : top5
	})
