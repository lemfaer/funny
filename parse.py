from bs4 import BeautifulSoup
from requests import get
from time import time
from re import sub
from db import *

def parse(content, nos, pos, nes, rr, ll = 0):
	def texts(soup, cls):
		texts = []
		for text in soup:
			text = text.get_text()
			text = sub("\s+", " ", text)
			text = sub(rr[1:-1], "", text) if rr else text

			if text and len(text) > ll:
				texts.append((text, cls, "YES"))

		return texts

	soup = BeautifulSoup(content, "html.parser")
	normal = texts(soup.find_all(nos), "normal") if nos else []
	positive = texts(soup.find_all(pos), "positive") if pos else []
	negative = texts(soup.find_all(nes), "negative") if nes else []
	ptexts = normal + positive + negative

	pcount = {
		"normal" : len(normal),
		"positive" : len(positive),
		"negative" : len(negative),
		"all" : len(ptexts)
	}

	return ptexts, pcount

def parse_links(cnx, lid, ll):
	stats = []
	left = select_lcount(cnx)
	avg, right = select_avg(cnx)
	right = right or 0
	avg = avg or 0

	for page in select_links(cnx):
		start = time()
		link, args = page[0], page[1:]

		response = get(link)
		loaded = time() - start

		clen = response.headers["Content-Length"]
		content = response.content

		texts, count = parse(content, *args, ll = ll)
		parsed = time() - start - loaded

		insert_texts(cnx, texts)
		rtime = time() - start

		left -= 1
		right += 1
		avg = avg + (rtime - avg) / right
		eta = left * avg

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

	return stats
