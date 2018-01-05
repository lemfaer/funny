from argparse import ArgumentParser
from functools import partial

arp = ArgumentParser()

arp.add_argument("--host", type=str, required=True)
arp.add_argument("--base", type=str, required=True)
arp.add_argument("--user", type=str, required=True)
arp.add_argument("--pass", dest="password", type=str, required=True)
arp.add_argument("--kernel", choices=[ "linear", "rbf" ], required=True)
arp.add_argument("--c", type=float, required=True)
arp.add_argument("--sigma", type=float, default=1)
arp.add_argument("--test", type=int, choices=range(0, 101), required=True)
arp.add_argument("--ngrams", type=int, required=True)

args = arp.parse_args()

sigma = args.sigma
kernel = args.kernel
ngrams = args.ngrams
test = args.test
c = args.c

base = {
	"host" : args.host,
	"user" : args.user,
	"password" : args.password,
	"database" : args.base
}
