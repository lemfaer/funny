import lxml
import lxml.html
from hashlib import sha256
from uuid import uuid4
import requests
import re

class Page:

	def __init__(self, link, args, ll=0):
		self.link = link
		self.limit = ll
		self.content = ""
		self.length = 0

		self.sel_normal = args[0]
		self.sel_positive = args[1]
		self.sel_negative = args[2]
		self.sel_unknown = args[3]
		self.reg_remove = args[4]

		self.normal = []
		self.positive = []
		self.negative = []
		self.unknown = []
		self.hashes = {}

	def load(self):
		response = requests.get(self.link)
		self.content = response.content
		self.length = int(response.headers["Content-Length"]
			if "Content-Length" in response.headers
			else len(self.content))

	def filter(self, nodes, rr=None, ll=None):
		rr = rr if rr is not None else self.reg_remove
		ll = ll if ll is not None else self.limit
		texts = []

		for text in nodes:
			text = text.text_content()
			text = re.sub(r"\s+", " ", text)
			text = re.sub(rr[1:-1], "", text) if rr else text

			if text and len(text) > ll:
				texts.append(text)

		return texts

	def parse(self):
		tree = lxml.html.document_fromstring(self.content)
		self.normal = self.filter(tree.xpath(self.sel_normal)) if self.sel_normal else []
		self.positive = self.filter(tree.xpath(self.sel_positive)) if self.sel_positive else []
		self.negative = self.filter(tree.xpath(self.sel_negative)) if self.sel_negative else []
		self.unknown = self.filter(tree.xpath(self.sel_unknown)) if self.sel_unknown else []

	def identify(self, predict):
		predict.text(self.normal, objl=1, senl=0)
		predict.text(self.positive, objl=-1, senl=1)
		predict.text(self.negative, objl=-1, senl=-1)
		uids = predict.text(self.unknown, objl=0, senl=0)
		predict.calc()

		for i, uid in enumerate(uids):
			type = predict.type(uid)
			texts = getattr(self, type)
			texts.append(self.unknown[i])

	def munique(self, unique):
		hashes = set(self.hashes.keys())
		remove = hashes - set(unique)

		for hash in remove:
			type, i = self.hashes.pop(hash)
			texts = getattr(self, type)
			texts[i] = None

		self.normal = list(filter(bool, self.normal))
		self.positive = list(filter(bool, self.positive))
		self.negative = list(filter(bool, self.negative))

	def count(self):
		normal = len(self.normal)
		positive = len(self.positive)
		negative = len(self.negative)
		all = sum((normal, positive, negative))

		return {
			"normal" : normal,
			"positive" : positive,
			"negative" : negative,
			"all" : all
		}

	def hash(self):
		hashes = {}

		for i, text in enumerate(self.normal):
			hash = sha256(text.encode("utf-8")).hexdigest()
			hashes[hash] = ("normal", i)

		for i, text in enumerate(self.positive):
			hash = sha256(text.encode("utf-8")).hexdigest()
			hashes[hash] = ("positive", i)

		for i, text in enumerate(self.negative):
			hash = sha256(text.encode("utf-8")).hexdigest()
			hashes[hash] = ("negative", i)

		self.hashes = hashes
		hashes = hashes.keys()
		hashes = list(hashes)

		return hashes

	def export(self):
		texts = []

		for text in self.normal:
			texts.append((text, "normal"))

		for text in self.positive:
			texts.append((text, "positive"))

		for text in self.negative:
			texts.append((text, "negative"))

		return texts
