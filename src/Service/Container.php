<?php

namespace Funny\Service;

use Throwable, Exception, Closure, ArrayObject;
use ReflectionClass, ReflectionFunction, ReflectionMethod, ReflectionFunctionAbstract;

class Container extends ArrayObject {

	function __construct(array $vals = []) {
		parent::__construct($vals);
		$this[get_class()] = $this;
	}

	/**
	 * Returns true if the container has an entry for the given class, otherwise false
	 *
	 * @param string $class class of the entry to look for
	 * @return bool
	 */
	function has($class) {
		return isset($this[$class]);
	}

	/**
	 * Finds an entry of the container by its class and returns it
	 *
	 * @param string $class class of the entry to look for
	 * @throws Exception error while retrieving the entry
	 * @return mixed
	 */
	function get($class) {
		if ($this->has($class)) {
			return $this[$class];
		}

		return $this->create($class);
	}

	/**
	 * Create an entry and returns it
	 *
	 * @param string $class class of the entry to create
	 * @param array $args additional arguments
	 * @throws Exception error while creating the entry
	 *
	 * @return mixed entry.
	 */
	function create($class, ...$args) {
		try {
			$class = new ReflectionClass($class);
			$method = $class->getConstructor();

			if ($method) {
				$args = $this->args($method, ...$args);
				$object = $class->newInstanceArgs($args);
			} else {
				$object = $class->newInstanceWithoutConstructor();
			}
		} catch (Throwable $prev) {
			throw new Exception($prev->getMessage(), 500, $prev);
		}

		return $object;
	}

	/**
	 * Calls an function providing entries of the container by identifiers and returns result
	 *
	 * @param callable|closure $func function to call
	 * @param array $args additional arguments
	 * @throws Exception error while executing an function
	 *
	 * @return mixed
	 */
	function call($func, ...$args) {
		return call_user_func_array($func, $this->args($func, ...$args));
	}

	/**
	 * Creates and returns arguments, if it's possible
	 *
	 * @param callable|closure|ReflectionFunctionAbstract $func function
	 * @param array $args additional arguments to merge
	 * @throws Exception error while creating the args
	 *
	 * @return array
	 */
	function args($func, ...$args) {
		if (is_string($func) || $func instanceof Closure) {
			$func = new ReflectionFunction($func);
		}

		if (is_array($func) && count($func) === 2) {
			$func = new ReflectionMethod(...$func);
		}

		if ($func instanceof ReflectionFunctionAbstract) {
			$fargs = [];
			foreach ($func->getParameters() as $arg) {
				if ($arg->isDefaultValueAvailable()) {
					break;
				}

				if (!$arg->getClass()) {
					break;
				}

				$class = $arg->getClass()->getName();
				$object = $this->get($class);
				$fargs[] = $object;
			}

			$args = array_merge($fargs, $args);
		}

		return $args;
	}

}
