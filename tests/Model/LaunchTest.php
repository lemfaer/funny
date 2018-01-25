<?php

namespace Funny\Test\Model;

use PHPUnit\Framework\TestCase;
use Funny\Service\{Connection, Container};
use Funny\Model\Launch;

class LaunchTest extends TestCase {

	/**
	 * @covers \Funny\Model\Launch::all
	 * @covers \Funny\Model\Model::set
	 * @dataProvider provider_all
	 */
	function test_all($data, $expected_query, $expected_result) {
		$launch = $this->getMockBuilder(Launch::class)
			->disableOriginalConstructor()
			->setMethods([ "pass" ])
			->getMock();

		$db = $this->getMockBuilder(Connection::class)
			->disableOriginalConstructor()
			->setMethods([ "prepare" ])
			->getMock();

		$statm = $this->getMockBuilder(PDOStatement::class)
			->disableOriginalConstructor()
			->setMethods([ "execute", "fetchAll" ])
			->getMock();

		// check query
		$query = null;
		$db->expects($this->once())
			->method("prepare")
			->will($this->returnCallback(function ($rquery) use ($statm, &$query) {
				$query = $rquery;
				return $statm;
			}));

		$statm->expects($this->once())
			->method("fetchAll")
			->will($this->returnValue($data));

		$launch->db = $db;
		$launch->container = new Container();
		$launch->container[Launch::class] = $launch;

		$result = $launch->all(1, 0);
		$result = array_shift($result);
		$result = $result->get([ "id", "type", "report", "created", "updated" ]);

		$this->assertSame(preg_replace("/\s+/", " ", $query), $expected_query);
		$this->assertSame($result, $expected_result);
	}

	function provider_all() {
		return [
			"default" => [
				"data" => [[
					"id" => 42,
					"type" => "parser",
					"report" => null,
					"created" => 0,
					"updated" => 0
				]],
				"query" => "SELECT *, unix_timestamp(created) AS created, unix_timestamp(updated) AS updated FROM launch ORDER BY id DESC LIMIT 1 OFFSET 0",
				"result" => [
					"id" => 42,
					"type" => "parser",
					"report" => null,
					"created" => 0,
					"updated" => 0
				]
			]
		];
	}

	/**
	 * @covers \Funny\Model\Launch::load
	 * @covers \Funny\Model\Model::set
	 * @dataProvider provider_load
	 */
	function test_load($data, $expected_query, $expected_result) {
		$launch = $this->getMockBuilder(Launch::class)
			->disableOriginalConstructor()
			->setMethods([ "pass" ])
			->getMock();

		$db = $this->getMockBuilder(Connection::class)
			->disableOriginalConstructor()
			->setMethods([ "prepare" ])
			->getMock();

		$statm = $this->getMockBuilder(PDOStatement::class)
			->disableOriginalConstructor()
			->setMethods([ "execute", "fetch" ])
			->getMock();

		// check query
		$query = null;
		$db->expects($this->once())
			->method("prepare")
			->will($this->returnCallback(function ($rquery) use ($statm, &$query) {
				$query = $rquery;
				return $statm;
			}));

		// replace binds
		$statm->expects($this->once())
			->method("execute")
			->will($this->returnCallback(function ($binds) use (&$query) {
				$id = array_shift($binds);
				$query = str_replace("?", $id, $query);
			}));

		$statm->expects($this->once())
			->method("fetch")
			->will($this->returnValue($data));

		$launch->db = $db;
		$launch->load($data["id"]);
		$result = $launch->get([ "id", "type", "report", "b", "alpha", "data", "created", "updated" ]);

		$this->assertSame(preg_replace("/\s+/", " ", $query), $expected_query);
		$this->assertSame($result, $expected_result);
	}

	function provider_load() {
		return [
			"default" => [
				"data" => [
					"id" => 42,
					"type" => "parser",
					"report" => null,
					"b" => "-0.664181",
					"alpha" => [],
					"data" => []
				],

				"query" => "SELECT b.*, a.*, unix_timestamp(a.created) AS created, unix_timestamp(a.updated) AS updated FROM launch AS a INNER JOIN weights AS b ON a.id = b.launch_id WHERE a.id = 42",

				"result" => [
					"id" => 42,
					"type" => "parser",
					"report" => null,
					"b" => "-0.664181",
					"alpha" => [],
					"data" => [],
					"created" => null,
					"updated" => null
				]
			]
		];
	}

	/**
	 * @covers \Funny\Model\Launch::last
	 * @covers \Funny\Model\Model::set
	 * @dataProvider provider_last
	 */
	function test_last($data, $expected_query, $expected_result) {
		$launch = $this->getMockBuilder(Launch::class)
			->disableOriginalConstructor()
			->setMethods([ "pass" ])
			->getMock();

		$db = $this->getMockBuilder(Connection::class)
			->disableOriginalConstructor()
			->setMethods([ "prepare" ])
			->getMock();

		$statm = $this->getMockBuilder(PDOStatement::class)
			->disableOriginalConstructor()
			->setMethods([ "execute", "fetch" ])
			->getMock();

		// check query
		$query = null;
		$db->expects($this->once())
			->method("prepare")
			->will($this->returnCallback(function ($rquery) use ($statm, &$query) {
				$query = $rquery;
				return $statm;
			}));

		// replace binds
		$statm->expects($this->once())
			->method("execute")
			->will($this->returnCallback(function ($binds) use (&$query) {
				$type = array_shift($binds);
				$query = str_replace("?", "'$type'", $query);
			}));

		$statm->expects($this->once())
			->method("fetch")
			->will($this->returnValue($data));

		$launch->db = $db;
		$launch->last($data["type"]);
		$result = $launch->get([ "id", "type", "report", "created", "updated" ]);

		$this->assertSame(preg_replace("/\s+/", " ", $query), $expected_query);
		$this->assertSame($result, $expected_result);
	}

	function provider_last() {
		$data = [
			"id" => 42,
			"type" => "parser",
			"report" => null,
			"created" => 0,
			"updated" => 0
		];

		return [
			"default" => [
				"data" => $data,
				"query" => "SELECT *, unix_timestamp(created) AS created, unix_timestamp(updated) AS updated FROM launch WHERE id = (SELECT max(id) FROM launch WHERE type = 'parser')",
				"result" => $data
			]
		];
	}

}
