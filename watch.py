from etime import eTime

stats = {}
origin = {}

def watch(svm, mode, cargs):
	stats[svm] = {}
	origin[svm] = {}
	origin[svm]["iter"] = svm.iter
	origin[svm]["kernel"] = svm.kernel
	svm.iter = witer(svm, mode, cargs)
	svm.kernel = wkernel(svm, mode)
	return svm

def wkernel(svm, mode):
	stats[svm][mode]["operations"] = 0
	def kernel(*args, **kwargs):
		stats[svm][mode]["operations"] += 1
		return svm.kernel(*args, **kwargs)
	return kernel

def witer(svm, mode, cargs, modifier=1e+6):
	right, avg = select_tavg(cnx, mode, 1 / modifier)
	avg = avg * modifier or 0
	right = right or 0
	left = ...

	def iter(*args, **kwargs):
		pass
