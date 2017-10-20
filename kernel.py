from __future__ import division
from math import exp

def linear(iv, jv):
	return sum([ ivo * jvo for ivo, jvo in zip(iv, jv) ])

def rbf(iv, jv, sigma = 1):
	s = sum([ (ivo - jvo) ** 2 for ivo, jvo in zip(iv, jv) ])
	return exp(-s / (sigma ** 2 * 2))
