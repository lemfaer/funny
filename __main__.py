from prepare import prepare, update, kernel
from report import create_report
from watch import watch, flush
from estimate import Estimate
from tt import train, test
from pysvm.svm import SVM
from args import *
from db import *

cnx = connect(**base)

lid = insert_launch(cnx)
stats, top, dl = prepare(cnx, lid, cargs["ngrams"], cargs["test"])
k = kernel(cargs["kernel"], cargs["sigma"])
estimate = Estimate()
estimate.read()

for mode, (trset, teset) in zip([ "objective", "sentiment" ], dl):
	svm = SVM(k, c=cargs["c"], tol=cargs["tol"], lpass=cargs["lpass"], liter=cargs["liter"])

	svm = watch(svm, mode, len(trset[0]), estimate, cnx, lid, cargs)
	tr = train(svm, mode, trset[0], trset[1], cnx)
	te = test(svm, mode, teset[0], teset[1])
	svm, ts = flush(svm, mode)
	stats = update(stats, tr, te, ts)

create_report(cnx, lid, stats, top, cargs)
estimate.train()
estimate.store()
cnx.close()
