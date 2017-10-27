<?php

namespace Funny\Test\Service;

use PHPUnit\Framework\TestCase;
use Funny\Service\{Container, Router};

class RouterTest extends TestCase {

	/**
	 * @covers \Funny\Service\Router::dispatch
	 * @dataProvider provider_dispatch
	 */
	function test_dispatch($routes, $method, $url, $expected) {
		$router = $this->getMockBuilder(Router::class)
			->disableOriginalConstructor()
			->setMethods([ "pass" ])
			->getMock();

		$container = $this->getMockBuilder(Container::class)
			->disableOriginalConstructor()
			->setMethods([ "get" ])
			->getMock();

		$container->expects($this->any())
			->method("get")
			->will($this->returnArgument(0));

		try {
			$router->container = $container;
			$router->exchangeArray($routes);
			$result = $router->dispatch($method, $url);
		} catch (\Exception $e) {
			$result = [
				"class" => get_class($e),
				"message" => $e->getMessage(),
				"code" => $e->getCode()
			];
		}

		$this->assertSame($expected, $result);
	}

	function provider_dispatch() {
		$routes = [
			[ "GET",  "~^employee/update/([0-9]+)$~", "a1" ],
			[ "POST", "~^employee/update/([0-9]+)$~", "a2" ],
			[ "GET",  "~^employee/delete/([0-9]+)$~", "a3" ],
			[ "POST", "~^employee/delete/([0-9]+)$~", "a4" ],
			[ "GET",  "~^employee/create~", [ "a5", "a5a" ] ]
		];

		return [
			"no_routes" => [
				"routes" => [],
				"method" => "GET",
				"url" => "employee/update/11",
				"result" => [
					"class" => \Exception::class,
					"message" => "Method not allowed",
					"code" => 400
				]
			],

			"wrong_method" => [
				"routes" => $routes,
				"method" => "PUT",
				"url" => "employee/update/11",
				"result" => [
					"class" => \Exception::class,
					"message" => "Method not allowed",
					"code" => 400
				]
			],

			"different_case" => [
				"routes" => $routes,
				"method" => "post",
				"url" => "employee/update/11",
				"result" => [ "a2", [ "11" ] ]
			],

			"same_case" => [
				"routes" => $routes,
				"method" => "GET",
				"url" => "employee/delete/23",
				"result" => [ "a3", [ "23" ] ]
			],

			"class_method" => [
				"routes" => $routes,
				"method" => "GET",
				"url" => "employee/create",
				"result" => [ [ "a5", "a5a" ], [] ]
			]
		];
	}

}
