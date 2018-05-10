from predict import Predict
from args import *
from db import *
import json

cnx = connect(**base)
svms, ngrams = select_last_weights(cnx)
indexes = select_indexes(cnx)

predict = Predict(svms, indexes, ngrams)
uid = predict.text(text)
predict.calc()

data = {
	"type" : predict.type(uid),
	"ratio" : predict.ratio(uid),
	"top" : predict.top(),
}

data = json.dumps(data)
print(data)
