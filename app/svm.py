from __future__ import division
from functools import partial
from itertools import chain
from random import randint

class SVM:
	""" Support vector machine """

	def __init__(self, kernel, c = 1, tol = 1e-4, atol = 1e-7, lpass = 1e1, liter = 1e4):
		self.__dict__.update(locals())

	def train(self, data, labels):
		b = 0
		data = zip(data, labels)
		alpha = [ 0 ] * len(data)
		niter, npass = 0, 0

		while niter < self.liter and npass < self.lpass:
			b, alpha, changed = self.iter(data, alpha, b)
			niter, npass = niter + 1, npass + 1 if not changed else 0

		self.b = b
		self.data = data
		self.alpha = alpha

		return b, alpha

	def predict(self, data):
		prediction = []

		for one in data:
			margin = self.margin(self.data, self.alpha, self.b, one)
			label = 1 if margin > 0 else -1
			prediction.append(label)

		return prediction

	def margin(self, data, alpha, b, v):
		return b + sum([ ai * il * self.kernel(v, iv) for (iv, il), ai in zip(data, alpha) ])

	def iter(self, data, alpha, b):
		n = len(data)
		rn = range(n)
		pj = partial(self.peekj, n)
		changed = False

		for i, j in zip(rn, map(pj, rn)):
			try:
				l, h = self.clh(data, alpha, i, j)
				ei, ej = self.ce(data, alpha, i, j, b)
				eta = self.ceta(data, i, j)
				alpha, dai, daj = self.upal(data, alpha, eta, i, j, ei, ej, l, h)
				b = self.bias(data, alpha, i, j, ei, ej, dai, daj, b)
			except:
				continue
			else:
				changed = True

		return b, alpha, changed

	def peekj(self, n, i):
		j = randint(0, n - 2)
		j += 1 if j >= i else 0
		return j

	def clh(self, data, alpha, i, j):
		(iv, il), ai = data[i], alpha[i]
		(jv, jl), aj = data[j], alpha[j]

		if il == jl:
			l = max(0, aj + ai - self.c)
			h = min(self.c, aj + ai)
		else:
			l = max(0, aj - ai)
			h = min(self.c, aj - ai + self.c)

		if abs(l - h) < 1e-4:
			raise Exception

		return l, h

	def ce(self, data, alpha, i, j, b):
		(iv, il), ai = data[i], alpha[i]
		(jv, jl), aj = data[j], alpha[j]

		ei = self.margin(data, alpha, b, iv) - il
		if ( not (il * ei < -self.tol and ai < self.c)
				and not (il * ei > self.tol and ai > 0) ):
			raise Exception

		return ei, self.margin(data, alpha, b, jv) - jl

	def ceta(self, data, i, j):
		iv, il, jv, jl = chain(data[i], data[j])
		eta = 2 * self.kernel(iv, jv) - self.kernel(iv, iv) - self.kernel(jv, jv)

		if eta >= 0:
			raise Exception

		return eta

	def upal(self, data, alpha, eta, i, j, ei, ej, l, h):
		(iv, il), ai = data[i], alpha[i]
		(jv, jl), aj = data[j], alpha[j]

		naj = aj - (ei - ej) * jl / eta;
		naj = l if naj < l else naj
		naj = h if naj > h else naj
		nai = ai + (aj - naj) * jl * il

		if abs(aj - naj) < 1e-4:
			raise Exception

		alpha[i] = nai
		alpha[j] = naj

		return alpha, nai - ai, naj - aj

	def bias(self, data, alpha, i, j, ei, ej, dai, daj, b):
		(iv, il), ai = data[i], alpha[i]
		(jv, jl), aj = data[j], alpha[j]

		b1 = (b - ei - il * dai * self.kernel(iv, iv)
		             - jl * daj * self.kernel(iv, jv))

		b2 = (b - ej - il * dai * self.kernel(iv, jv)
		             - jl * daj * self.kernel(jv, jv))

		b = (b1 + b2) / 2
		b = b1 if 0 < ai < self.c else b
		b = b2 if 0 < aj < self.c else b

		return b
