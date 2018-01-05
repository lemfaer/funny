from functools import partial
from re import sub

def combined(text, nfuns = ()):
	res = []

	if isinstance(nfuns, int):
		mode, nfuns = nfuns, []
		mode & UNIGRAM and nfuns.append(unigram)
		mode & BIGRAM  and nfuns.append(bigram)
		mode & TRIGRAM and nfuns.append(trigram)
		mode & CHARS4  and nfuns.append(chars4)

	for nfun in nfuns:
		res.extend(nfun(text))

	return res

sep = "_"
WORDS, CHARS = 0, 1
def ngrams(text, n = 2, mode = WORDS):
	_sep = sep if mode == WORDS else ""
	entities = text.split(_sep) if _sep else list(text)
	result, buffer = [], []

	for entity in entities:
		buffer.append(entity)
		if len(buffer) == n:
			result.append(_sep.join(buffer))
			buffer.pop(0)

	return result

def tnorm(text):
	text = sub(r"[^\w\s]", "", text)
	text = sub(r"\s", sep, text)
	text = text.strip()
	text = text.lower()
	return text

UNIGRAM, unigram = 1 << 0, partial(ngrams, n = 1)
BIGRAM,  bigram  = 1 << 1, partial(ngrams, n = 2)
TRIGRAM, trigram = 1 << 2, partial(ngrams, n = 3)
CHARS4,  chars4  = 1 << 3, partial(ngrams, n = 4, mode = CHARS)
