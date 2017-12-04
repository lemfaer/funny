from __future__ import division, print_function
from report import create_report
from parse import parse_links
from args import base, ll
from db import *

cnx = connect(**base)
delete_texts(cnx)

lid = insert_launch(cnx)
stats = parse_links(cnx, lid, ll)
create_report(cnx, lid, stats)
