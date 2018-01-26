<?php

namespace Funny\Test\Controller;

use Throwable, Exception;
use PHPUnit\Framework\TestCase;
use Funny\Controller\Launch as Controller;
use Funny\Model\Launch;
use Funny\Model\Stats;

class LaunchTest extends TestCase {

	/**
	 * @covers \Funny\Controller\Launch::all
	 * @dataProvider provider_all
	 */
	function test_all($data, $expected) {
		$controller = $this->getMockBuilder(Controller::class)
			->disableOriginalConstructor()
			->setMethods([ "pass" ])
			->getMock();

		$model = $this->getMockBuilder(Launch::class)
			->disableOriginalConstructor()
			->setMethods([ "all", "get" ])
			->getMock();

		$model->expects($this->once())
			->method("all")
			->will($this->returnValue(array_fill(0, count($data), $model)));

		$model->expects($this->any())
			->method("get")
			->with($this->equalTo([ "id", "type", "report", "weights", "created", "updated" ]))
			->will($this->returnCallback(function () use (&$data) {
				return array_shift($data);
			}));

		$result = $controller->all($model, 2);
		$this->assertSame($expected, $result);
	}

	function provider_all() {
		return [
			"default" => [
				"data" => [
					[
						"id" => 42,
						"type" => "parser",
						"report" => null,
						"created" => 0,
						"updated" => 0
					],

					[
						"id" => 102,
						"type" => "classifier",
						"report" => null,
						"created" => 0,
						"updated" => 0
					]
				],

				"result" => '[{"id":42,"type":"parser","report":null,"created":0,"updated":0},{"id":102,"type":"classifier","report":null,"created":0,"updated":0}]'
			]
		];
	}

	/**
	 * @covers \Funny\Controller\Launch::get
	 * @covers \Funny\Controller\Controller::safe
	 * @dataProvider provider_get
	 */
	function test_get($id, $loaddo, $data, $expected) {
		$controller = $this->getMockBuilder(Controller::class)
			->disableOriginalConstructor()
			->setMethods([ "pass" ])
			->getMock();

		$model = $this->getMockBuilder(Launch::class)
			->disableOriginalConstructor()
			->setMethods([ "load", "get" ])
			->getMock();

		$model->expects($this->once())
			->method("load")
			->will($loaddo);

		$model->expects($this->any())
			->method("get")
			->with($this->equalTo([ "id", "type", "report", "weights", "created", "updated" ]))
			->will($this->returnCallback(function () use ($data) {
				return $data;
			}));

		try {
			$result = $controller->get($model, $id);
		} catch (Throwable $e) {
			$result = [
				"class" => get_class($e),
				"message" => $e->getMessage(),
				"code" => $e->getCode()
			];
		}

		$this->assertSame($expected, $result);
	}

	function provider_get() {
		return [
			"default" => [
				"id" => 42,
				"load" => $this->returnValue(null),

				"data" => [
					"id" => 42,
					"type" => "parser",
					"report" => null,
					"created" => 0,
					"updated" => 0
				],

				"result" => '{"id":42,"type":"parser","report":null,"created":0,"updated":0}'
			],

			"not_found" => [
				"id" => 102,
				"load" => $this->throwException(new Exception()),
				"data" => null,

				"result" => [
					"class" => Exception::class,
					"message" => "Not found",
					"code" => 404
				]
			]
		];
	}

	/**
	 * @covers \Funny\Controller\Launch::last
	 * @covers \Funny\Controller\Controller::safe
	 * @dataProvider provider_last
	 */
	function test_last($type, $lastdo, $data, $expected) {
		$controller = $this->getMockBuilder(Controller::class)
			->disableOriginalConstructor()
			->setMethods([ "pass" ])
			->getMock();

		$model = $this->getMockBuilder(Launch::class)
			->disableOriginalConstructor()
			->setMethods([ "last", "get" ])
			->getMock();

		$model->expects($this->once())
			->method("last")
			->will($lastdo);

		$model->expects($this->any())
			->method("get")
			->with($this->equalTo([ "id", "type", "report", "weights", "created", "updated" ]))
			->will($this->returnCallback(function () use ($data) {
				return $data;
			}));

		try {
			$result = $controller->last($model, $type);
		} catch (Throwable $e) {
			$result = [
				"class" => get_class($e),
				"message" => $e->getMessage(),
				"code" => $e->getCode()
			];
		}

		$this->assertSame($expected, $result);
	}

	function provider_last() {
		return [
			"default" => [
				"type" => "parser",
				"last" => $this->returnValue(null),

				"data" => [
					"id" => 42,
					"type" => "parser",
					"report" => null,
					"created" => 0,
					"updated" => 0
				],

				"result" => '{"id":42,"type":"parser","report":null,"created":0,"updated":0}'
			],

			"not_found" => [
				"type" => "classifier",
				"last" => $this->throwException(new Exception()),
				"data" => null,

				"result" => [
					"class" => Exception::class,
					"message" => "Not found",
					"code" => 404
				]
			]
		];
	}

	/**
	 * @covers \Funny\Controller\Launch::eta
	 * @covers \Funny\Controller\Controller::safe
	 * @dataProvider provider_eta
	 */
	function test_eta($lid, $lastdo, $data, $expected) {
		$controller = $this->getMockBuilder(Controller::class)
			->disableOriginalConstructor()
			->setMethods([ "pass" ])
			->getMock();

		$model = $this->getMockBuilder(Stats::class)
			->disableOriginalConstructor()
			->setMethods([ "last", "get" ])
			->getMock();

		$model->expects($this->once())
			->method("last")
			->will($lastdo);

		$model->expects($this->any())
			->method("get")
			->with($this->equalTo([ "id", "type", "launch_id", "time", "eta", "info", "created", "updated" ]))
			->will($this->returnCallback(function () use ($data) {
				return $data;
			}));

		try {
			$result = $controller->eta($model, $lid);
		} catch (Throwable $e) {
			$result = [
				"class" => get_class($e),
				"message" => $e->getMessage(),
				"code" => $e->getCode()
			];
		}

		$this->assertSame($expected, $result);
	}

	function provider_eta() {
		return [
			"default" => [
				"lid" => 19,
				"last" => $this->returnValue(null),

				"data" => [
					"id" => 14,
					"type" => "parser",
					"launch_id" => 19,
					"time" => "0.353",
					"eta" => 0,
					"info" => '{"eta": 0, "len": "24463", "link": "https://wikipedia.org/wiki/N-gram", "time": 0.3529999256134033, "loaded": 0.2650001049041748, "parsed": 0.08599996566772461}',
					"created" => 0,
					"updated" => 0
				],

				"result" => '{"id":14,"type":"parser","launch_id":19,"time":"0.353","eta":0,"info":"{\"eta\": 0, \"len\": \"24463\", \"link\": \"https:\/\/wikipedia.org\/wiki\/N-gram\", \"time\": 0.3529999256134033, \"loaded\": 0.2650001049041748, \"parsed\": 0.08599996566772461}","created":0,"updated":0}'
			],

			"not_found" => [
				"id" => 42,
				"last" => $this->throwException(new Exception()),
				"data" => null,

				"result" => [
					"class" => Exception::class,
					"message" => "Not found",
					"code" => 404
				]
			]
		];
	}

}
