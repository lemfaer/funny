from prepare import prepare, kernel
# from watch import watch, flush
from tt import train, test
from pysvm.svm import SVM
from args import *
from db import *

cnx = connect(**base)

lid = insert_launch(cnx)
stats, top, dl = prepare(cnx, lid, cargs.pop("ngrams"), cargs.pop("test"))
k = kernel(cargs.pop("kernel"), cargs.pop("sigma"))

for mode, (trset, teset) in zip([ "objective", "sentiment" ], dl):
	svm = SVM(k, **cargs)

	# svm = watch(svm, ...)
	tr = train(svm, mode, trset[0], trset[1], cnx)
	te = test(svm, mode, teset[0], teset[1])
	# svm, stats
	# stats.update(flush(svm))

	print(tr, te, sep="\n\n", end="\n\n")

cnx.close()
