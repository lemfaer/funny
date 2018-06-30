<?php

namespace Funny\Service;
use Throwable;

class Handler {

	/**
	 * Register exception handler
	 * @return void
	 */
	function register() {
		set_exception_handler([ $this, "handle" ]);
	}

	/**
	 * Handle exception
	 * @param Throwable $e exception
	 * @return void
	 */
	function handle(Throwable $e) {
		http_response_code(intval($e->getCode()));
		echo sprintf('"%s"', $e->getMessage());
		die;
	}
}
