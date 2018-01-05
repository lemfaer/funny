from __future__ import division, print_function
from copy import deepcopy
from math import log

class Index:

	def __init__(self):
		self.positive = 0
		self.negative = 0
		self.texts = []
		self.words = {}
		self.labels = {}
		self.sample = {
			"word" : "",
			"count" : 0,
			"positive" : 0,
			"negative" : 0,
			"texts" : {}
		}

	def append(self, words, tid, label):
		self.texts.append(tid)
		self.labels[tid] = label

		if label == 1:
			self.positive += 1

		if label == -1:
			self.negative += 1

		for word in words:
			if not word:
				continue

			self.words.setdefault(word, deepcopy(self.sample))
			self.words[word]["count"] += 1
			self.words[word]["word"] = word
			self.words[word]["texts"].setdefault(tid, 0)
			self.words[word]["texts"][tid] += 1

			if label == 1:
				self.words[word]["positive"] += 1

			if label == -1:
				self.words[word]["negative"] += 1

		return

	def wdelta(self, npos, nneg, pos, neg):
		npos += 1; nneg += 1 # a hack
		return log((neg * npos) / (pos * nneg))

	def delta(self):
		texts = { tid : 0 for tid in self.texts }
		words = { word : 0 for word in self.words }

		p, n = self.positive, self.negative
		for word in self.words.values():
			wid, wp, wn = word["word"], word["positive"], word["negative"]
			words[wid] = self.wdelta(wp, wn, p, n) if p and n else 0

			for tid, count in word["texts"].items():
				texts[tid] += words[wid] * count

		return texts, words
