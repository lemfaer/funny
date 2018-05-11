from argparse import ArgumentParser

arp = ArgumentParser()

arp.add_argument("--host", type=str, required=True)
arp.add_argument("--base", type=str, required=True)
arp.add_argument("--user", type=str, required=True)
arp.add_argument("--pass", dest="password", type=str, required=True)
arp.add_argument("--minlen", type=int, required=True)
arp.add_argument("--script", type=str, required=True)

args = arp.parse_args()

base = {
	"host" : args.host,
	"user" : args.user,
	"password" : args.password,
	"database" : args.base
}

ll = args.minlen
script = args.script
