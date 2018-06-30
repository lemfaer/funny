import numpy as np
from scipy.optimize import curve_fit
from os.path import dirname, realpath, isfile, isdir
from json import load, dump
from os import makedirs

class Estimate:

	def __init__(self, origin = dirname(__file__) + "/estimate.json"):
		self.origin = realpath(origin)
		self.data = { "last" : None, "n" : [], "tol" : [], "count" : [] }

	def func(self, x, a, b):
		return x[0,:] / (b * x[1,:]**a)

	def count(self, n, avc, cargs):
		if not self.data["last"]:
			return .15 * cargs["liter"] * avc

		data = np.array([ [n], [cargs["tol"]] ])
		count = self.func(data, *self.data["last"])
		return np.asscalar(count[0])

	def time(self, avt, count, done = 0):
		return avt * (count - done)

	def train(self):
		try:
			y = np.array(self.data["count"])
			x = np.array([ self.data["n"], self.data["tol"] ])
			popt, pcov = curve_fit(self.func, x, y, self.data["last"])
			self.data["last"] = popt.tolist()
		except:
			pass

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
		if not isdir(dirname(self.origin)):
			makedirs(dirname(self.origin))

		file = open(self.origin, "w")
		dump(self.data, file, sort_keys=True, indent="\t", separators=(",", " : "))
		file.write("\n")
