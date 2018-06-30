<?php

namespace Funny\Model;
use Funny\Service\{Config, Connection, Container};

class Model {

	function __construct(Config $config, Connection $connection, Container $container) {
		$this->db = $connection;
		$this->config = $config;
		$this->container = $container;
	}

	/**
	 * Returns array representation of object
	 * @param array $data fields to get
	 * @return array
	 */
	function get(array $data) {
		$values = [];
		foreach ($data as $key) {
			$values[$key] = $this->$key ?? null;
		}

		return $values;
	}

	/**
	 * Set values from array
	 * @param array $data
	 */
	function set(array $data) {
		foreach ($data as $key => $value) {
			$this->$key = $value;
		}
	}

}
