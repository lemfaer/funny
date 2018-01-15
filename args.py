from argparse import ArgumentParser
from functools import partial

arp = ArgumentParser()

arp.add_argument("--host", type=str, required=True)
arp.add_argument("--base", type=str, required=True)
arp.add_argument("--user", type=str, required=True)
arp.add_argument("--pass", dest="password", type=str, required=True)

arp.add_argument("--kernel", choices=[ "linear", "rbf" ], required=True)
arp.add_argument("--test", type=int, choices=range(0, 101), required=True)
arp.add_argument("--ngrams", type=int, required=True)
arp.add_argument("--c", type=float, required=True)
arp.add_argument("--sigma", type=float, required=True)
arp.add_argument("--tol", type=float, required=True)
arp.add_argument("--lpass", type=int, required=True)
arp.add_argument("--liter", type=int, required=True)

args = arp.parse_args()

base = {
	"host" : args.host,
	"user" : args.user,
	"password" : args.password,
	"database" : args.base
}

cargs = {
	"sigma" : args.sigma,
	"kernel" : args.kernel,
	"ngrams" : args.ngrams,
	"lpass" : args.lpass,
	"liter" : args.liter,
	"test" : args.test,
	"tol" : args.tol,
	"c" : args.c
}
