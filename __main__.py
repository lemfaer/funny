from predict.predict import Predict
from predict.db import select_last_weights, select_indexes
from args import base, script, ll
from report import create_report
from time import time
from page import Page
from db import *

if script:
	mode = "follow"
else:
	mode = "parser"

try:
	cnx = connect(**base)
	lid = insert_launch(cnx, mode)
	left = select_lcount(cnx, script)
	avg, right = select_avg(cnx)
	right = right or 0
	avg = avg or 0
	stats = []

	if mode == "parser":
		delete_texts(cnx)

	if mode == "follow":
		indexes = select_indexes(cnx)
		svms, ngrams = select_last_weights(cnx)
		predict = Predict(svms, indexes, ngrams)

	for data in select_links(cnx, script):
		start = time()
		link, args = data[0], data[1:]
		page = Page(link, args, ll=ll)

		page.load()
		loaded = time() - start

		page.parse()
		parsed = time() - start - loaded

		if mode == "follow":
			page.identify(predict)
			predicted = time() - start - loaded - parsed
		else:
			predicted = 0

		uniq = select_unique(cnx, page)
		page.munique(uniq)

		insert_texts(cnx, page)
		rtime = time() - start

		left -= 1
		right += 1
		avg = avg + (rtime - avg) / right
		eta = left * avg

		clen = page.length
		count = page.count()

		s = {
			"link" : link,
			"args" : args,
			"count" : count,
			"loaded" : loaded,
			"parsed" : parsed,
			"predicted" : predicted,
			"time" : rtime,
			"len" : clen,
			"eta" : eta
		}

		insert_stats(cnx, lid, mode, s)
		stats.append(s)

	if stats:
		if mode == "parser":
			top5 = []
			top30 = []

		if mode == "follow":
			top5 = predict.top(5)
			top30 = predict.top(30)

		create_report(cnx, lid, ll, stats, top5, top30)
	else:
		delete_launch(cnx, lid)
except:
	delete_launch(cnx, lid)
	raise
finally:
	cnx.close()
