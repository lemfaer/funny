import numpy as np
from scipy.optimize import curve_fit
from os.path import dirname, realpath, isfile
from json import load, dump
from os import makedirs

class eTime:

	def __init__(self, origin = "./etime.json"):
		self.origin = realpath(origin)
		self.data = { "last" : None, "n" : [], "tol" : [], "count" : [] }

	def func(self, x, a, b):
		return x[:,0] / (b * x[:,1]**a)

	def predict(self, n, tol, avc, avt, cargs):
		if not self.data["last"]:
			return .15 * cargs.liter * avc * avt

		data = np.array([ n, tol ])
		count = self.func(data, *self.data["last"])
		time = count * avt

		return time

	def train(self, count):
		y = np.array(self.data["count"])
		x = np.array([ self.data["n"], self.data["tol"] ])
		popt, pcov = curve_fit(self.func, x, y, self.data["last"])
		self.data["last"] = popt

	def append(self, n, tol, count):
		self.data["n"].append(n)
		self.data["tol"].append(tol)
		self.data["count"].append(count)

	def read(self):
		if not isfile(self.origin):
			return

		file = open(self.origin, "r")
		self.data = load(file)

	def store(self):
		if not isfile(self.origin):
			makedirs(dirname(self.origin))

		file = open(self.origin, "w")
		dump(self.data, file, sort_keys=True, indent="\t", separators=(",", " : "))
