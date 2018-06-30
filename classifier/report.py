from db import *

def create_report(cnx, lid, stats, top, cargs):
	if len(stats) != 3:
		raise Exception

	otop, stop = top
	ps = stats["prepare"]["stats"]
	os = stats["objective"]["stats"]
	ss = stats["sentiment"]["stats"]

	prepare_time = sum([ s["time"] for s in ps ])
	objective_time = sum([ s["time"] for s in os ])
	sentiment_time = sum([ s["time"] for s in ss ])
	total_texts = sum([ s["texts"] for s in ps ])
	total_words = sum([ s["words"] for s in ps ])

	update_launch(cnx, lid, {
		"kernel" : cargs["kernel"],
		"ngrams" : cargs["ngrams"],
		"lpass" : cargs["lpass"],
		"liter" : cargs["liter"],
		"sigma" : cargs["sigma"],
		"test" : cargs["test"],
		"tol" : cargs["tol"],
		"c" : cargs["c"],

		"prepare" : {
			"estimation" : ps[0]["eta"] + ps[0]["time"],
			"time" : prepare_time,
			"texts" : total_texts,
			"total_words" : total_words,
			"average_words" : total_words / total_texts
		},

		"objective" : {
			"estimation" : os[0]["eta"] + os[0]["time"],
			"train" : stats["objective"]["train"],
			"test" : stats["objective"]["test"],
			"time" : objective_time,
			"top" : otop
		},

		"sentiment" : {
			"estimation" : ss[0]["eta"] + ss[0]["time"],
			"train" : stats["sentiment"]["train"],
			"test" : stats["sentiment"]["test"],
			"time" : sentiment_time,
			"top" : stop
		}
	})
