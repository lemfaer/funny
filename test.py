from __future__ import print_function
from svm import SVM
from kernel import linear, rbf

data = [
	[ -0.4326, 1.1909 ],
	[ 3, 4 ],
	[ 0.1253, -0.0376 ],
	[ 0.2877, 0.3273 ],
	[ -1.1465, 0.1746 ],
	[ 1.8133, 2.1139 ],
	[ 2.7258, 3.0668 ],
	[ 1.4117, 2.0593 ],
	[ 4.1832, 1.9044 ],
	[ 1.8636, 1.1677 ]
]

labels = [ 1, 1, 1, 1, 1, -1, -1, -1, -1, -1 ]

svm = SVM(rbf)
# svm = SVM(linear)
b, alpha = svm.train(data, labels)
prediction = svm.predict(data)
print("b: %.2f, alpha: %s, prediction: %s" % (b, str(alpha), str(prediction)))
