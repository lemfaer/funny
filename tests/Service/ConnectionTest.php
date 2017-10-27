<?php

namespace Funny\Test\Service;

use Throwable, ReflectionClass;
use PHPUnit\Framework\TestCase;
use Funny\Service\{Config, Connection};

class ConnectionTest extends TestCase {

	/**
	 * @covers \Funny\Service\Connection::__construct
	 * @dataProvider provider_construct
	 */
	function test_construct($config, $expected) {
		$result = new Connection($config);
		$this->assertEquals($expected, $result);
	}

	function provider_construct() {
		$db = [
			"host" => "127.0.0.1",
			"base" => "test",
			"user" => "root",
			"pass" => "root",
			"options" => [ \PDO::MYSQL_ATTR_INIT_COMMAND => "set names utf8" ]
		];

		$cls = new ReflectionClass(Connection::class);
		$obj = $cls->newInstanceWithoutConstructor();

		$obj->host = $db["host"];
		$obj->base = $db["base"];
		$obj->user = $db["user"];
		$obj->pass = $db["pass"];
		$obj->options = $db["options"];

		return [
			"default" => [
				"config" => new Config([ "db" => $db ]),
				"result" => $obj
			]
		];
	}

	/**
	 * @covers \Funny\Service\Connection::__call
	 * @dataProvider provider_call
	 */
	function test_call($name, $db, $pdo, $expected_db, $expected_result) {
		$connection = $this->getMockBuilder(Connection::class)
			->disableOriginalConstructor()
			->setMethods([ "create" ])
			->getMock();

		$connection->expects($this->any())
			->method("create")
			->with("mysql:host=127.0.0.1;dbname=test", "root", "", [])
			->will($this->returnValue($pdo));

		try {
			$connection->host = "127.0.0.1";
			$connection->base = "test";
			$connection->user = "root";
			$connection->pass = "";
			$connection->options = [];
			$connection->db = $db;

			$result = $connection->$name("arg1", "arg2");
			$db = $connection->db;
		} catch (Throwable $e) {
			$result = [
				"class" => get_class($e),
				"message" => $e->getMessage(),
				"code" => $e->getCode()
			];
		}

		// $this->assertSame($expected_db, $db);
		$this->assertSame($expected_result, $result);
	}

	function provider_call() {
		$pdo = $this->getMockBuilder(PDO::class)
			->disableOriginalConstructor()
			->setMethods([ "prepare" ])
			->getMock();

		$pdo->expects($this->any())
			->method("prepare")
			->with("arg1", "arg2")
			->will($this->returnValue([ "result1", "result2" ]));

		return [
			"create_connection" => [
				"name" => "prepare",
				"db" => null,
				"pdo" => $pdo,
				"edb" => $pdo,
				"result" => [ "result1", "result2" ]
			],

			"use_stored_connection" => [
				"name" => "prepare",
				"db" => $pdo,
				"pdo" => null,
				"edb" => $pdo,
				"result" => [ "result1", "result2" ]
			]
		];
	}

}
