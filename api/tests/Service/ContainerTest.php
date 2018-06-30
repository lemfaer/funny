<?php

namespace Funny\Test\Service;

use Throwable;
use PHPUnit\Framework\{TestCase, Error};
use PHPUnit\Framework\Error\Warning;
use Funny\Service\Container;

class ContainerTest extends TestCase {

	/**
	 * @covers \Funny\Service\Container::has
	 * @dataProvider provider_has
	 */
	function test_has($exists) {
		$container = $this->getMockBuilder(Container::class)
			->disableOriginalConstructor()
			->setMethods([ "offsetExists" ])
			->getMock();

		$container->expects($this->once())
			->method("offsetExists")
			->with($this->equalTo("class"))
			->will($this->returnValue($exists));

		$result = $container->has("class");
		$this->assertSame($exists, $result);
	}

	function provider_has() {
		return [
			"exists" => [ true ],
			"not exists" => [ false ]
		];
	}

	/**
	 * @covers \Funny\Service\Container::get
	 * @dataProvider provider_get
	 */
	function test_get($object, $new, $class, $once, $expected_set, $expected_result) {
		$container = $this->getMockBuilder(Container::class)
			->disableOriginalConstructor()
			->setMethods([ "offsetGet", "offsetSet", "has", "create" ])
			->getMock();

		$container->expects($this->any())
			->method("offsetGet")
			->with($this->equalTo($class))
			->will($this->returnValue($object));

		// set value
		$set = null;
		$container->expects($this->any())
			->method("offsetSet")
			->with($this->equalTo($class), $this->isInstanceOf($class))
			->will($this->returnCallback(function ($class, $object) use (&$set) {
				return $set = $object;
			}));

		$container->expects($this->any())
			->method("has")
			->with($this->equalTo($class))
			->will($this->returnValue(!empty($object)));

		$container->expects($this->any())
			->method("create")
			->with($this->equalTo($class))
			->will($this->returnValue($new));

		$container->once = $once;
		$result = $container->get($class);

		$this->assertSame($expected_set, $set);
		$this->assertSame($expected_result, $result);
	}

	function provider_get() {
		$new = new \stdClass();
		$object = new \stdClass();

		return [
			"exists" => [
				"object" => $object,
				"new" => null,
				"class" => null,
				"once" => null,
				"set" => null,
				"result" => $object
			],

			"class_not_exists" => [
				"object" => null,
				"new" => null,
				"class" => "@",
				"once" => [],
				"set" => null,
				"result" => null
			],

			"create" => [
				"object" => null,
				"new" => $new,
				"class" => \stdClass::class,
				"once" => [],
				"set" => null,
				"result" => $new
			]
		];
	}

	/**
	 * @covers \Funny\Service\Container::create
	 * @dataProvider provider_create
	 */
	function test_create($class, $args, $expected_result, $expected_exception) {
		$container = $this->getMockBuilder(Container::class)
			->disableOriginalConstructor()
			->setMethods([ "args" ])
			->getMock();

		$container->expects($this->any())
			->method("args")
			->will($this->returnValue($args));

		try {
			$result = $container->create($class, ...$args);
		} catch (Throwable $e) {
			$exception = [
				"class" => get_class($e),
				"prev" => get_class($e->getPrevious()),
				"message" => $e->getMessage(),
				"code" => $e->getCode()
			];
		}

		if (isset($exception)) {
			$this->assertSame($expected_exception, $exception);
		} elseif (is_object($result)) {
			$this->assertInstanceOf($expected_result, $result);
		} else {
			$this->assertSame($expected_result, $result);
		}
	}

	function provider_create() {
		return [
			"class_null" => [
				"class" => null,
				"args" => [],
				"result" => null,
				"exception" => [
					"class" => \Exception::class,
					"prev" => \ReflectionException::class,
					"message" => "Class  does not exist",
					"code" => 500
				]
			],

			"class_not_exists" => [
				"class" => "@",
				"args" => [],
				"result" => null,
				"exception" => [
					"class" => \Exception::class,
					"prev" => \ReflectionException::class,
					"message" => "Class @ does not exist",
					"code" => 500
				]
			],

			"class_no_constructor" => [
				"class" => \stdClass::class,
				"args" => [],
				"result" => \stdClass::class,
				"exception" => null
			],

			"class_with_constructor" => [
				"class" => \Exception::class,
				"args" => [],
				"result" => \Exception::class,
				"exception" => null
			],

			"class_no_required_args" => [
				"class" => \RegexIterator::class,
				"args" => [],
				"result" => null,
				"exception" => [
					"class" => \Exception::class,
					"prev" => \ArgumentCountError::class,
					"message" => "RegexIterator::__construct() expects at least 2 parameters, 0 given",
					"code" => 500
				]
			],

			"class_with_required_args" => [
				"class" => \RegexIterator::class,
				"args" => [ new \ArrayIterator([]), "/^text_/" ],
				"result" => \RegexIterator::class,
				"exception" => null
			],

			"class_wrong_required_args" => [
				"class" => \RegexIterator::class,
				"args" => [ "/^text_/", new \ArrayIterator([]) ],
				"result" => null,
				"exception" => [
					"class" => \Exception::class,
					"prev" => \TypeError::class,
					"message" => "RegexIterator::__construct() expects parameter 1 to be Iterator, string given",
					"code" => 500
				]
			]
		];
	}

	/**
	 * @covers \Funny\Service\Container::call
	 * @dataProvider provider_call
	 */
	function test_call($func, $args, $expected_result, $expected_exception) {
		$container = $this->getMockBuilder(Container::class)
			->disableOriginalConstructor()
			->setMethods([ "args" ])
			->getMock();

		$container->expects($this->any())
			->method("args")
			->will($this->returnValue($args));

		try {
			$result = $container->call($func, ...$args);
		} catch (Throwable $e) {
			$exception = [
				"class" => get_class($e),
				"message" => $e->getMessage(),
				"code" => $e->getCode()
			];
		}

		$this->assertSame($expected_result, $result ?? null);
		$this->assertSame($expected_exception, $exception ?? null);
	}

	function provider_call() {
		return [
			"function_null" => [
				"func" => null,
				"args" => [],
				"result" => null,
				"exception" => [
					"class" => Warning::class,
					"message" => "call_user_func_array() expects parameter 1 to be a valid callback, no array or string given",
					"code" => 2
				]
			],

			"function_not_exists" => [
				"func" => "@",
				"args" => [],
				"result" => null,
				"exception" => [
					"class" => Warning::class,
					"message" => "call_user_func_array() expects parameter 1 to be a valid callback, function '@' not found or invalid function name",
					"code" => 2
				]
			],

			"function_no_args" => [
				"func" => "get_class",
				"args" => [],
				"result" => Container::class,
				"exception" => null
			],

			"function_no_required_args" => [
				"func" => "strlen",
				"args" => [],
				"result" => null,
				"exception" => [
					"class" => Warning::class,
					"message" => "strlen() expects exactly 1 parameter, 0 given",
					"code" => 2
				]
			],

			"function_with_required_args" => [
				"func" => "strlen",
				"args" => [ "str" ],
				"result" => 3,
				"exception" => null
			],

			"function_wrong_required_args" => [
				"func" => "strlen",
				"args" => [ [] ],
				"result" => null,
				"exception" => [
					"class" => Warning::class,
					"message" => "strlen() expects parameter 1 to be string, array given",
					"code" => 2
				]
			]
		];
	}

	/**
	 * @covers \Funny\Service\Container::args
	 * @dataProvider provider_args
	 */
	function test_args($func, $args, $class, $obj, $expected) {
		$container = $this->getMockBuilder(Container::class)
			->disableOriginalConstructor()
			->setMethods([ "get" ])
			->getMock();

		$container->expects($this->any())
			->method("get")
			->with($this->equalTo($class))
			->will($this->returnValue($obj));

		$result = $container->args($func, ...$args);
		$this->assertSame($expected, $result);
	}

	function provider_args() {
		$obj = new \stdClass();
		$node = new \DOMNode();

		return [
			"reflector" => [
				"func" => new \ReflectionMethod($node, "isSameNode"),
				"args" => [],
				"class" => \DOMNode::class,
				"obj" => $node,
				"result" => [ $node ]
			],

			"function" => [
				"func" => "iterator_apply",
				"args" => [ "strlen", [] ],
				"class" => \Traversable::class,
				"obj" => $obj,
				"result" => [ $obj, "strlen", [] ]
			],

			"closure" => [
				"func" => (new \ReflectionFunction("iterator_apply"))->getClosure(),
				"args" => [ "strlen" ],
				"class" => \Traversable::class,
				"obj" => $obj,
				"result" => [ $obj, "strlen" ]
			],

			"method" => [
				"func" => [ $node, "replaceChild" ],
				"args" => [ 1, 2, 3, 4 ],
				"class" => \DOMNode::class,
				"obj" => $node,
				"result" => [ $node, $node, 1, 2, 3, 4 ]
			]
		];
	}

}
