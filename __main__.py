from learn import learn
from report import *
from args import *
from db import *

cnx = connect(**base)
lid = insert_launch(cnx)
stats, obj, sen = learn(cnx, lid, kernel, c, sigma, test, ngrams)
create_report(cnx, lid, kernel, c, sigma, test, ngrams, stats, obj, sen)
cnx.close()
