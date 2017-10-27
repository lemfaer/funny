<?php

namespace Funny\Service;
use PDO;

class Connection {

	function __construct(Config $config) {
		$this->host = $config["db"]["host"];
		$this->base = $config["db"]["base"];
		$this->user = $config["db"]["user"];
		$this->pass = $config["db"]["pass"];
		$this->options = $config["db"]["options"];
	}

	/**
	 * Calls pdo connection methods and returns result
	 *
	 * @param string $name function name
	 * @param array $args function arguments
	 * @return mixed
	 */
	function __call($name, $args) {
		if (empty($this->db)) {
			$dsn = "mysql:host={$this->host};dbname={$this->base}";
			$this->db = $this->create($dsn, $this->user, $this->pass, $this->options);
		}

		return $this->db->$name(...$args);
	}

	/**
	 * Creates new PDO conntection
	 * @see PDO::__construct
	 */
	function create(string $dsn, string $user = "", string $pass = "", array $options = []) {
		return new PDO($dsn, $user, $pass, $options);
	}

}
