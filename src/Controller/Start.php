<?php

namespace Funny\Controller;

use Throwable;
use Funny\Model\Launch;

class Start extends Controller {

	/** POST /start/parser */
	function parser(Launch $launch, $attempts = 10) {
		$params = $this->input();

		$host = $this->config["db"]["host"];
		$base = $this->config["db"]["base"];
		$user = $this->config["db"]["user"];
		$pass = $this->config["db"]["pass"];
		$path = $this->config["app"]["parser"];
		$path = escapeshellcmd(realpath($path));
		$python = $this->config["app"]["python"];
		$minlen = $params["minlen"];

		$last = $id = $this->lastid($launch, "parser");
		$command = '%s %s --host "%s" --base "%s" --user "%s" --pass "%s" --minlen %d --script "parser"';
		$command = sprintf($command, $python, $path, $host, $base, $user, $pass, $minlen);
		$this->run($command);

		while ($id === $last && $attempts) {
			usleep(500 * 1000);
			$id = $this->lastid($launch, "parser");
			$attempts--;
		}

		return $id;
	}

	/** POST /start/classifier */
	function classifier(Launch $launch, $attempts = 10) {
		$params = $this->input();

		$host = $this->config["db"]["host"];
		$base = $this->config["db"]["base"];
		$user = $this->config["db"]["user"];
		$pass = $this->config["db"]["pass"];
		$path = $this->config["app"]["classifier"];
		$path = escapeshellcmd(realpath($path));
		$python = $this->config["app"]["python"];

		$sigma = $params["sigma"];
		$kernel = escapeshellarg($params["kernel"]);
		$ngrams = $params["ngrams"];
		$lpass = $params["lpass"];
		$liter = $params["liter"];
		$test = $params["test"];
		$tol = $params["tol"];
		$c = $params["c"];

		$last = $id = $this->lastid($launch, "classifier");
		$command = '%s %s --host "%s" --base "%s" --user "%s" --pass "%s" --sigma %f '
			. '--kernel %s --ngrams %d --lpass %d --liter %d --test %d --tol %f --c %f';
		$command = sprintf($command, $python, $path, $host, $base, $user, $pass, $sigma,
			$kernel, $ngrams, $lpass, $liter, $test, $tol, $c);
		$this->run($command);

		while ($id === $last && $attempts) {
			usleep(500 * 1000);
			$id = $this->lastid($launch, "classifier");
			$attempts--;
		}

		return $id;
	}

	/** POST /start/predict */
	function predict() {
		$params = $this->input();

		$host = $this->config["db"]["host"];
		$base = $this->config["db"]["base"];
		$user = $this->config["db"]["user"];
		$pass = $this->config["db"]["pass"];
		$path = $this->config["app"]["predict"];
		$path = escapeshellcmd(realpath($path));
		$python = $this->config["app"]["python"];
		$text = escapeshellarg($params["text"]);

		$command = '%s %s --host "%s" --base "%s" --user "%s" --pass "%s" --text %s 2>&1';
		$command = sprintf($command, $python, $path, $host, $base, $user, $pass, $text);

		return shell_exec($command);
	}

	function run($cmd) {
		if (strcasecmp("Windows", substr(php_uname("s"), 0, 7)) === 0) {
			pclose(popen("start /B $cmd", "r"));
		} else {
			exec("$cmd > /dev/null 2>/dev/null &");
		}
	}

	function lastid($launch, $type) {
		try {
			$launch->last($type);
			return intval($launch->id);
		} catch (Throwable $e) {
			return 0;
		}
	}

}
