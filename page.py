import lxml
import lxml.html
from re import sub
import requests

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
			text = sub(r"\s+", " ", text)
			text = sub(rr[1:-1], "", text) if rr else text

			if text and len(text) > ll:
				texts.append(text)

		return texts

	def parse(self):
		tree = lxml.html.document_fromstring(self.content)
		self.normal = self.filter(tree.xpath(self.sel_normal)) if self.sel_normal else []
		self.positive = self.filter(tree.xpath(self.sel_positive)) if self.sel_positive else []
		self.negative = self.filter(tree.xpath(self.sel_negative)) if self.sel_negative else []
		self.unknown = self.filter(tree.xpath(self.sel_unknown)) if self.sel_unknown else []

	def predict(self, predict):
		pass

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

	def export(self):
		texts = []

		for text in self.normal:
			texts.append((text, "normal"))

		for text in self.positive:
			texts.append((text, "positive"))

		for text in self.negative:
			texts.append((text, "negative"))

		return texts
