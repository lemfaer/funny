from db import *

def create_report(cnx, lid, kernel, c, sigma, test, ngrams, stats, obj, sen):
	if len(stats) != 3:
		return

	obj_svm, obj_perf, obj_top = obj
	sen_svm, sen_perf, sen_top = sen

	obj_train_size = len(obj_svm.data)
	sen_train_size = len(sen_svm.data)

	prepare_time = sum([ s["time"] for s in stats["prepare"] ])
	objective_time = sum([ s["time"] for s in stats["objective"] ])
	sentiment_time = sum([ s["time"] for s in stats["sentiment"] ])
	total_texts = sum([ s["texts"] for s in stats["prepare"] ])
	total_words = sum([ s["words"] for s in stats["prepare"] ])

	update_launch(cnx, lid, {
		"kernel" : kernel,
		"ngrams" : ngrams,
		"sigma" : sigma,
		"test" : test,
		"c" : c,

		"prepare" : {
			"estimation" : stats["prepare"][0]["eta"] + stats["prepare"][0]["time"],
			"time" : prepare_time,
			"texts" : total_texts,
			"total_words" : total_words,
			"average_words" : total_words / total_texts
		},

		"objective" : {
			"estimation" : stats["objective"][0]["eta"] + stats["objective"][0]["time"],
			"time" : objective_time,
			"train" : obj_train_size,
			"test" : obj_perf,
			"top" : obj_top
		},

		"sentiment" : {
			"estimation" : stats["sentiment"][0]["eta"] + stats["sentiment"][0]["time"],
			"time" : sentiment_time,
			"train" : sen_train_size,
			"test" : sen_perf,
			"top" : sen_top
		}
	})
