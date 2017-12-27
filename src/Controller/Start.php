<?php

namespace Funny\Controller;
use Funny\Model\Launch;

class Start extends Controller {

	/** POST /start/parser */
	function parser(Launch $launch) {
		$params = $this->input();

		$host = $this->config["db"]["host"];
		$base = $this->config["db"]["base"];
		$user = $this->config["db"]["user"];
		$pass = $this->config["db"]["pass"];
		$path = $this->config["app"]["parser"];
		$path = escapeshellcmd(realpath($path));
		$python = $this->config["app"]["python"];
		$minlen = $params["minlen"];

		$command = '%s %s --host "%s" --base "%s" --user "%s" --pass "%s" --minlen %d';
		$command = sprintf($command, $python, $path, $host, $base, $user, $pass, $minlen);
		$this->run($command);

		usleep(500 * 1000);
		$this->safe([ $launch, "last" ], "parser");

		return $launch->id;
	}

	function run($cmd) {
		if (strcasecmp("Windows", substr(php_uname("s"), 0, 7)) === 0) {
			pclose(popen("start /B $cmd", "r"));
		} else {
			exec("$cmd > /dev/null 2>/dev/null &");
		}
	}

}
