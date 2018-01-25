from text import tnorm, combined
from operator import itemgetter
from functools import partial
from pysvm.kernel import *
from index import Index
from time import time
import collections
from db import *

def prepare(cnx, lid, ngrams, test):
	obj, sen = Index(), Index()

	stats = {}
	left = select_tcount(cnx)
	right, avg = select_pavg(cnx)
	right = right or 0
	avg = avg or 0

	count = 0
	cwords = 0
	ctime = 0
	step = 0

	for tid, text, cls in select_texts(cnx):
		start = time()
		words = combined(tnorm(text), ngrams)
		obj.append(words, tid, 1 if cls == "normal" else -1)
		cls != "normal" and sen.append(words, tid, 1 if cls == "positive" else -1)
		end = time() - start

		left -= 1
		right += 1
		count += 1
		ctime += end
		cwords += len(words)

		avg = avg + (end - avg) / right
		eta = left * avg

		if not step:
			step = max(left // 10, .5 // avg)

		if count == step or not left:
			s = {
				"texts" : count,
				"words" : cwords,
				"stage" : "prepare",
				"time" : ctime,
				"eta" : eta
			}

			insert_stats(cnx, lid, s)
			stats.setdefault("prepare", {})
			stats["prepare"].setdefault("stats", [])
			stats["prepare"]["stats"].append(s)

			count = 0
			cwords = 0
			ctime = 0

	obj_data, sen_data = data(obj, test), data(sen, test)
	obj_words, sen_words = obj_data.pop(), sen_data.pop()
	obj_top, sen_top = top(obj_words), top(sen_words)

	return stats, (obj_top, sen_top), (obj_data, sen_data)

def data(index, test):
	data, labels = [], []
	texts, words = index.delta()

	for tid, delta in texts.items():
		data.append([ delta, 0 ])
		labels.append(index.labels[tid])

	train = 1 - (test / 100)
	pos, neg = labels.count(1), labels.count(-1)
	plim, nlim = int(pos * train), int(neg * train)

	pc, nc = 0, 0
	data1, data2 = [], []
	labels1, labels2 = [], []

	for item, label in zip(data, labels):
		if label == 1 and pc < plim:
			pc += 1
			data1.append(item)
			labels1.append(label)
			continue

		if label == -1 and nc < nlim:
			nc += 1
			data1.append(item)
			labels1.append(label)
			continue

		data2.append(item)
		labels2.append(label)

	return [ (data1, labels1), (data2, labels2), words ]

def top(words):
	words = sorted(words.items(), key=itemgetter(1))
	highest, lowest = words[-15:], words[:15]
	highest.sort(key=itemgetter(1), reverse=True)
	return highest, lowest

def kernel(name, sigma):
	if name == "linear":
		kernel = linear

	if name == "rbf":
		kernel = partial(rbf, sigma=sigma)

	return kernel

def update(d, *uu):
	for u in uu:
		for k, v in u.items():
			if isinstance(v, collections.Mapping):
				d[k] = update(d.get(k, {}), v)
			else:
				d[k] = v
	return d
