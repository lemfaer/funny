from time import time
from db import select_tavg, insert_stats
from sys import maxsize
glob = {}

def watch(svm, mode, n, estimate, cnx, lid, cargs):
	winit(svm, mode, n, estimate, cnx, lid, cargs)
	svm.iter = witer(svm, mode, estimate, cnx, lid, cargs)
	svm.kernel = wkernel(svm, mode)
	return svm

def winit(svm, mode, n, estimate, cnx, lid, cargs, modifier=1e+6):
	operations, iterations, avg = select_tavg(cnx, mode, 1 / modifier)

	glob[svm, mode] = {
		"n" : n,
		"cnx" : cnx,
		"lid" : lid,
		"cargs" : cargs,
		"iter" : svm.iter,
		"kernel" : svm.kernel,
		"estimate" : estimate,
		"iterations" : iterations or 0,
		"operations" : operations or 0,
		"avg" : (avg or 0) / modifier,
		"start" : time(),
		"stats" : []
	}

def witer(svm, mode, estimate, cnx, lid, cargs):
	glob = globals()["glob"][svm, mode]
	stats = glob["stats"]

	start = time()
	count, left = 0, 0
	tick = maxsize
	eta = 0

	def iter(*args, **kwargs):
		nonlocal eta, count, start, left, tick
		end = time() - start

		if not count and glob["avg"]:
			avc = glob["iterations"] / glob["operations"]
			count = left = glob["count"] = estimate.count(glob["n"], avc, cargs)
			eta = estimate.time(glob["avg"], count)
			tick = max(eta * .15, .5)

		if end > tick:
			stats[-1]["time"] = end
			start = glob["start"] = time()
			left -= stats[-1]["operations"]
			per = end / stats[-1]["operations"]
			glob["avg"] = glob["avg"] + (per - glob["avg"]) / glob["operations"]
			eta = stats[-1]["eta"] = estimate.time(glob["avg"], left)
			insert_stats(cnx, lid, stats[-1])

		if end > tick or not stats:
			stats.append({})
			stats[-1]["stage"] = mode
			stats[-1]["iterations"] = 0
			stats[-1]["operations"] = 0

		glob["iterations"] += 1
		stats[-1]["iterations"] += 1

		return glob["iter"](*args, **kwargs)

	return iter

def wkernel(svm, mode):
	glob = globals()["glob"][svm, mode]
	stats = glob["stats"]

	def kernel(*args, **kwargs):
		glob["operations"] += 1
		stats[-1]["operations"] += 1
		return glob["kernel"](*args, **kwargs)

	return kernel

def flush(svm, mode):
	glob = globals()["glob"][svm, mode]
	stats = glob["stats"]

	# restore default funcs
	svm.iter = glob["iter"]
	svm.kernel = glob["kernel"]

	# store last stats in db
	stats[-1]["eta"] = 0
	stats[-1]["time"] = time() - glob["start"]
	insert_stats(glob["cnx"], glob["lid"], stats[-1])

	# update prediction values
	n, tol = glob["n"], glob["cargs"]["tol"]
	count = sum([ s["operations"] for s in stats ])
	glob["estimate"].append(n, tol, count)

	return svm, { mode : { "stats" : stats } }
