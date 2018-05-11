from __future__ import division, print_function
from report import create_report
from args import base, ll
from time import time
from page import Page
from db import *

cnx = connect(**base)
lid = insert_launch(cnx)
left = select_lcount(cnx)
avg, right = select_avg(cnx)
right = right or 0
avg = avg or 0
stats = []

delete_texts(cnx)

for data in select_links(cnx):
	start = time()
	link, args = data[0], data[1:]
	page = Page(link, args, ll=ll)

	page.load()
	loaded = time() - start

	page.parse()
	parsed = time() - start - loaded

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
		"time" : rtime,
		"len" : clen,
		"eta" : eta
	}

	insert_stats(cnx, lid, s)
	stats.append(s)

create_report(cnx, lid, ll, stats)
cnx.close()
