from classifier.text import tnorm, combined
from bisect import bisect
from uuid import uuid4

class Predict:

	def __init__(self, svms, indexes, ngrams):
		self.words = {}
		self.deltas = {}
		self.deltas["objective"] = {}
		self.deltas["sentiment"] = {}
		self.obji = indexes["objective"]
		self.seni = indexes["sentiment"]
		self.obj = svms["objective"]
		self.sen = svms["sentiment"]
		self.ngrams = ngrams

	def text(self, text):
		uid = uuid4()
		words = combined(tnorm(text), self.ngrams)

		self.words[uid] = words
		self.obji.append(words, uid, 0)
		self.seni.append(words, uid, 0)

		return uid

	def calc(self):
		texts, words = self.obji.delta()
		self.deltas["objective"]["words"] = words
		self.deltas["objective"]["texts"] = texts

		texts, words = self.seni.delta()
		self.deltas["sentiment"]["words"] = words
		self.deltas["sentiment"]["texts"] = texts

	def ratio(self, uid):
		odata = self.deltas["objective"]["texts"][uid]
		sdata = self.deltas["sentiment"]["texts"][uid]
		return { "objective" : odata, "sentiment" : sdata }

	def type(self, uid):
		odata = self.deltas["objective"]["texts"][uid]
		sdata = self.deltas["sentiment"]["texts"][uid]

		res = self.obj.predict([ [ odata, 0 ] ])
		res = "normal" if res[0] == 1 else "other"

		if res == "other":
			res = self.sen.predict([ [ sdata, 0 ] ])
			res = "positive" if res[0] == 1 else "negative"

		return res

	def top(self, n = 15):
		delta = self.deltas["sentiment"]["words"]
		top = [ None for i in range(n) ]
		topi = [ 0 for i in range(n) ]
		topw = set()

		for words in self.words.values():
			for word in words:
				if word in topw:
					continue

				d = delta[word]
				ad = abs(d)

				if ad > topi[0]:
					topw.add(word)
					i = bisect(topi, ad)
					top.insert(i, (word, d))
					topi.insert(i, ad)
					topi.pop(0)
					top.pop(0)

		return top
