<?php

namespace Funny\Service;
use Exception, ArrayObject;

class Router extends ArrayObject {

	function __construct(Config $config, Container $container) {
		$this->container = $container;
		parent::__construct($config["routes"]);
	}

	/**
	 * Dispatches against the provided HTTP method verb and URI.
	 * Returns array with the following format: [ $handler, $args ]
	 *
	 * @param string $method
	 * @param string $url
	 * @return array
	 */
	function dispatch($method, $url) {
		foreach ($this as list($allowed, $pattern, $handler)) {
			if (preg_match($pattern, $url, $args) && !strcasecmp($method, $allowed)) {
				if (count($handler) === 2) {
					$handler = [ $this->container->get($handler[0]), $handler[1] ];
				}

				return [ $handler, array_slice($args, 1) ];
			}
		}

		// 404 http error if not found
		throw new Exception("Method not allowed", 400);
	}

}
