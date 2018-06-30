<?php

namespace Funny\Controller;

use Throwable, Exception;
use Funny\Service\{Config, Container, Validator};

class Controller {

	function __construct(Config $config, Container $container, Validator $validator) {
		$this->config = $config;
		$this->container = $container;
		$this->validator = $validator;
	}

	function input() {
		if (empty($_SERVER["CONTENT_TYPE"]) || $_SERVER["CONTENT_TYPE"] !== "application/json") {
			return $_POST;
		}

		$input = file_get_contents("php://input");
		$input = json_decode($input, true);
		return $input;
	}

	function safe($func, ...$args) {
		try {
			return call_user_func_array($func, $args);
		} catch (Throwable $prev) {
			throw new Exception("Not found", 404, $prev);
		}
	}

}
