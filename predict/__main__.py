from predict import Predict
from sys import exit
from args import *
from db import *
import json

data = {
	"type" : None,
	"ratio" : {},
	"top" : []
}

try:
	cnx = connect(**base)
	svms, ngrams = select_last_weights(cnx)
	indexes = select_indexes(cnx)

	predict = Predict(svms, indexes, ngrams)
	uid = predict.text([text]).pop()
	predict.calc()

	data["type"] = predict.type(uid)
	data["ratio"] = predict.ratio(uid)
	data["top"] = predict.top()
except:
	pass
finally:
	data = json.dumps(data)
	print(data)
	exit(0)

