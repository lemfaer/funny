<?php

namespace Funny\Test\Controller;

use Throwable, Exception;
use PHPUnit\Framework\TestCase;
use Funny\Service\Validator;
use Funny\Controller\Text as Controller;
use Funny\Model\Text as Model;

class TextTest extends TestCase {

	/**
	 * @covers \Funny\Controller\Text::all
	 * @dataProvider provider_all
	 */
	function test_all($data, $expected) {
		$controller = $this->getMockBuilder(Controller::class)
			->disableOriginalConstructor()
			->setMethods([ "pass" ])
			->getMock();

		$model = $this->getMockBuilder(Model::class)
			->disableOriginalConstructor()
			->setMethods([ "all", "get" ])
			->getMock();

		$model->expects($this->once())
			->method("all")
			->will($this->returnValue(array_fill(0, count($data), $model)));

		$model->expects($this->any())
			->method("get")
			->with($this->equalTo([ "id", "text", "class", "temp", "created", "updated" ]))
			->will($this->returnCallback(function () use (&$data) {
				return array_shift($data);
			}));

		$result = $controller->all($model);
		$this->assertSame($expected, $result);
	}

	function provider_all() {
		return [
			"default" => [
				"data" => [
					[
						"id" => 42,
						"text" => "",
						"class" => "normal",
						"temp" => "YES",
						"created" => 0,
						"updated" => 0
					],

					[
						"id" => 70,
						"text" => "test",
						"class" => "positive",
						"temp" => "NO",
						"created" => 0,
						"updated" => 0
					]
				],

				"result" => '[{"id":42,"text":"","class":"normal","temp":"YES","created":0,"updated":0},{"id":70,"text":"test","class":"positive","temp":"NO","created":0,"updated":0}]'
			]
		];
	}

	/**
	 * @covers \Funny\Controller\Text::get
	 * @covers \Funny\Controller\Controller::safe
	 * @dataProvider provider_get
	 */
	function test_get($id, $loaddo, $data, $expected) {
		$controller = $this->getMockBuilder(Controller::class)
			->disableOriginalConstructor()
			->setMethods([ "pass" ])
			->getMock();

		$model = $this->getMockBuilder(Model::class)
			->disableOriginalConstructor()
			->setMethods([ "load", "get" ])
			->getMock();

		$model->expects($this->once())
			->method("load")
			->will($loaddo);

		$model->expects($this->any())
			->method("get")
			->with($this->equalTo([ "id", "text", "class", "temp", "created", "updated" ]))
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
					"text" => "",
					"class" => "normal",
					"temp" => "YES",
					"created" => 0,
					"updated" => 0
				],

				"result" => '{"id":42,"text":"","class":"normal","temp":"YES","created":0,"updated":0}'
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
	 * @covers \Funny\Controller\Text::save
	 * @covers \Funny\Controller\Controller::safe
	 * @dataProvider provider_save
	 */
	function test_save($id, $loaddo, $data, $expected) {
		$controller = $this->getMockBuilder(Controller::class)
			->disableOriginalConstructor()
			->setMethods([ "input" ])
			->getMock();

		$controller->expects($this->any())
			->method("input")
			->will($this->returnValue($data));

		$model = $this->getMockBuilder(Model::class)
			->disableOriginalConstructor()
			->setMethods([ "load", "set", "save" ])
			->getMock();

		$model->expects($this->any())
			->method("load")
			->will($loaddo);

		$model->expects($this->any())
			->method("set")
			->with($this->equalTo($data))
			->will($this->returnValue(null));

		try {
			$controller->validator = new Validator();
			$result = $controller->save($model, $id);
		} catch (Throwable $e) {
			$result = [
				"class" => get_class($e),
				"message" => $e->getMessage(),
				"code" => $e->getCode()
			];
		}

		$this->assertSame($expected, $result);
	}

	function provider_save() {
		return [
			"create" => [
				"id" => 0,
				"load" => $this->returnValue(null),

				"data" => [
					"text" => "",
					"class" => "normal",
					"temp" => "YES"
				],

				"result" => null
			],

			"update" => [
				"id" => 42,
				"load" => $this->returnValue(null),

				"data" => [
					"text" => "",
					"class" => "normal",
					"temp" => "YES"
				],

				"result" => null
			],

			"not_found" => [
				"id" => 102,
				"load" => $this->throwException(new Exception()),

				"data" => [
					"text" => "",
					"class" => "normal",
					"temp" => "YES"
				],

				"result" => [
					"class" => Exception::class,
					"message" => "Not found",
					"code" => 404
				]
			],

			"wrong_data" => [
				"id" => 42,
				"load" => $this->returnValue(null),

				"data" => [
					"text" => "",
					"class" => "objective",
					"temp" => true
				],

				"result" => [
					"class" => Exception::class,
					"message" => "Wrong data",
					"code" => 400
				]
			]
		];
	}

	/**
	 * @covers \Funny\Controller\Text::del
	 * @covers \Funny\Controller\Controller::safe
	 * @dataProvider provider_del
	 */
	function test_del($id, $loaddo, $expected) {
		$controller = $this->getMockBuilder(Controller::class)
			->disableOriginalConstructor()
			->setMethods([ "pass" ])
			->getMock();

		$model = $this->getMockBuilder(Model::class)
			->disableOriginalConstructor()
			->setMethods([ "load", "del" ])
			->getMock();

		$model->expects($this->any())
			->method("load")
			->will($loaddo);

		try {
			$result = $controller->del($model, $id);
		} catch (Throwable $e) {
			$result = [
				"class" => get_class($e),
				"message" => $e->getMessage(),
				"code" => $e->getCode()
			];
		}

		$this->assertSame($expected, $result);
	}

	function provider_del() {
		return [
			"default" => [
				"id" => 42,
				"load" => $this->returnValue(null),
				"result" => null
			],

			"not_found" => [
				"id" => 102,
				"load" => $this->throwException(new Exception()),
				"result" => [
					"class" => Exception::class,
					"message" => "Not found",
					"code" => 404
				]
			],
		];
	}

}
