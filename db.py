import json
from mysql.connector import connect
from classifier.index import Index
from functools import partial
from pysvm.kernel import *
from pysvm.svm import SVM

def kernel(name, sigma):
	if name == "linear":
		kernel = linear

	if name == "rbf":
		kernel = partial(rbf, sigma=sigma)

	return kernel

def select_last_weights(cnx):
	svms = {}
	cursor = cnx.cursor()

	cursor.execute("""
		SELECT w.type, w.b, w.alpha, w.data, l.report FROM weights AS w
		INNER JOIN launch AS l ON w.launch_id = l.id
		WHERE w.id IN (SELECT max(id) FROM weights GROUP BY type)
	""")

	for type, b, alpha, data, report in cursor:
		r = json.loads(report)
		k = kernel(r["kernel"], r["sigma"])
		svm = SVM(k, c=r["c"], tol=r["tol"], lpass=r["lpass"], liter=r["liter"])

		svm.b = b
		svm.alpha = json.loads(alpha)
		svm.data = json.loads(data)

		svms[type] = svm

	return svms, r["ngrams"]

def select_indexes(cnx):
	indexes = {}
	cursor = cnx.cursor()
	cursor.execute("SELECT type, data FROM iindex")

	for type, data in cursor:
		index = Index()
		index.importo(json.loads(data))
		indexes[type] = index

	return indexes
