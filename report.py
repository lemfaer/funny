from db import *

def create_report(cnx, lid, ll, stats):
	if not stats:
		return

	loaded   = [ s["loaded"] for s in stats ]
	parsed   = [ s["parsed"] for s in stats ]
	rtime    = [ s["time"]   for s in stats ]
	texts    = [ s["count"]["all"] for s in stats ]
	normal   = [ s["count"]["normal"] for s in stats ]
	positive = [ s["count"]["positive"] for s in stats ]
	negative = [ s["count"]["negative"] for s in stats ]

	update_launch(cnx, lid, {
		"minimum_text_length" : ll,
		"original_estimate" : stats[0]["eta"] + stats[0]["time"],

		"total_normal_parsed" : sum(normal),
		"total_positive_parsed" : sum(positive),
		"total_negative_parsed" : sum(negative),
		"total_parsed" : sum(texts),
		"total_time_loaded" : sum(loaded),
		"total_time_parsed" : sum(parsed),
		"total_time" : sum(rtime),

		"average_parsed" : sum(texts) / len(texts),
		"average_time_loaded" : sum(loaded) / len(stats),
		"average_time_parsed" : sum(parsed) / len(stats),
		"average_time" : sum(rtime) / len(stats),

		"links" : stats
	})
