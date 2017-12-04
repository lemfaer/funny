from db import *

def create_report(cnx, lid, stats):
	if not stats:
		return

	loaded = [ s["loaded"] for s in stats ]
	parsed = [ s["parsed"] for s in stats ]
	rtime  = [ s["time"]   for s in stats ]

	update_launch(cnx, lid, {
		"original_estimate" : stats[0]["eta"] + stats[0]["time"],

		"average_time_loaded" : sum(loaded) / len(stats),
		"average_time_parsed" : sum(parsed) / len(stats),
		"average_time" : sum(rtime) / len(stats),

		"total_time_loaded" : sum(loaded),
		"total_time_parsed" : sum(parsed),
		"total_time" : sum(rtime),

		"links" : stats
	})
