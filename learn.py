from text import tnorm, combined
from operator import itemgetter
from functools import partial
from pysvm.kernel import *
from pysvm.svm import SVM
from index import Index
from time import time
from db import *

stats = {}

def learn(cnx, lid, kernel, c, sigma, tests, ngrams):
	obj, sen = Index(), Index()

	global stats
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
			stats.setdefault("prepare", [])
			stats["prepare"].append(s)

			count = 0
			cwords = 0
			ctime = 0

	obj_data, sen_data = data(obj, tests), data(sen, tests)
	obj_svm = svm(*obj_data[0], kernel=realkernel(cnx, lid, "objective", obj_data[0], kernel, sigma), c=c)
	sen_svm = svm(*sen_data[0], kernel=realkernel(cnx, lid, "sentiment", sen_data[0], kernel, sigma), c=c)
	obj_perf, sen_perf = test(obj_svm, *obj_data[1]), test(sen_svm, *sen_data[1])
	obj_top, sen_top = top(obj_data[2]), top(sen_data[2])
	store_result(cnx, "objective", obj_svm.b, obj_svm.alpha, obj_svm.data)
	store_result(cnx, "sentiment", sen_svm.b, sen_svm.alpha, sen_svm.data)

	return stats, (obj_svm, obj_perf, obj_top), (sen_svm, sen_perf, sen_top)

def realkernel(cnx, lid, mode, data, kername, sigma):
	if kername == "linear":
		kernel = linear

	if kername == "rbf":
		kernel = partial(rbf, sigma=sigma)

	modifier = 10e+5
	total = len(data[0]) ** 3 * 2
	left = total / modifier
	right, avg = select_tavg(cnx, mode, 1 / modifier)
	right = right or 0
	avg = avg or 0

	i = 0
	cur = 0
	start = time()

	import sys
	def kerbal(*args, **kwargs):
		global stats
		nonlocal i, cur, left, right, start, avg

		i += 1
		cur += 1

		if i % modifier == 0 or i == total:
			left -= 1
			right += 1
			end = time() - start
			start = time()

			avg = avg + (end - avg) / right
			eta = left * avg
			s = {
				"time" : end,
				"stage" : mode,
				"operations" : cur,
				"eta" : eta
			}

			print("iteration #%d, time: %.2f, eta: %.2f" % (i, end, eta))
			sys.stdout.flush()

			insert_stats(cnx, lid, s)
			stats.setdefault(mode, [])
			stats[mode].append(s)
			cur = 0

		return kernel(*args, **kwargs)

	return kerbal

def data(index, tests):
	data, labels = [], []
	texts, words = index.delta()

	for tid, delta in texts.items():
		data.append([ delta, delta ])
		labels.append(index.labels[tid])

	train = 1 - (tests / 100)
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

	return (data1, labels1), (data2, labels2), words

def svm(data, labels, kernel=rbf, c=1):
	svm = SVM(kernel, c=c)
	svm.train(data, labels)
	return svm

def test(svm, data, labels):
	predict = svm.predict(data)

	miss = [i for i, (prop, real)
		in enumerate(zip(predict, labels))
		if prop != real]

	return {
		"size" : len(labels),
		"hit" : len(labels) - len(miss),
		"miss" : len(miss),
		"perf" : 1 - (len(miss) / len(labels))
	}

def top(words):
	words = sorted(words.items(), key=itemgetter(1))
	highest, lowest = words[-15:], words[:15]
	highest.sort(key=itemgetter(1), reverse=True)
	return highest, lowest
