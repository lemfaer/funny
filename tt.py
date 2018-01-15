from db import store_result
from time import time

def train(svm, mode, data, labels, cnx):
	start = time()
	svm.train(data, labels)
	store_result(cnx, mode, svm.b, svm.alpha, svm.data)
	end = time() - start

	return {
		mode : {
			"train" : {
				"size" : len(labels),
				"time" : end
			}
		}
	}

def test(svm, mode, data, labels):
	start = time()
	predict = svm.predict(data)
	end = time() - start

	miss = [i for i, (prop, real)
		in enumerate(zip(predict, labels))
		if prop != real]

	return {
		mode : {
			"test" : {
				"size" : len(labels),
				"time" : end,
				"hit" : len(labels) - len(miss),
				"miss" : len(miss),
				"perf" : 1 - (len(miss) / len(labels))
			}
		}
	}
