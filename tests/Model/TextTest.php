<?php

namespace Funny\Test\Model;

use PHPUnit\Framework\TestCase;
use Funny\Service\{Connection, Container};
use Funny\Model\Text;

class TextTest extends TestCase {

	/**
	 * @covers \Funny\Model\Text::all
	 * @covers \Funny\Model\Model::set
	 * @dataProvider provider_all
	 */
	function test_all($data, $expected_query, $expected_result) {
		$text = $this->getMockBuilder(Text::class)
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

		$text->db = $db;
		$text->container = new Container();
		$text->container[Text::class] = $text;

		$result = $text->all();
		$result = array_shift($result);
		$result = $result->get([ "id", "text", "class", "temp" ]);

		$this->assertSame(preg_replace("/\s+/", " ", $query), $expected_query);
		$this->assertSame($result, $expected_result);
	}

	function provider_all() {
		return [
			"default" => [
				"data" => [[
					"id" => 1,
					"text" => "",
					"class" => "normal",
					"temp" => "YES"
				]],
				"query" => "SELECT *, unix_timestamp(created) AS created, unix_timestamp(updated) AS updated FROM text",
				"result" => [
					"id" => 1,
					"text" => "",
					"class" => "normal",
					"temp" => "YES"
				]
			]
		];
	}

	/**
	 * @covers \Funny\Model\Text::load
	 * @covers \Funny\Model\Model::set
	 * @dataProvider provider_load
	 */
	function test_load($data, $expected_query, $expected_result) {
		$text = $this->getMockBuilder(Text::class)
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

		$text->db = $db;
		$text->load($data["id"]);
		$result = $text->get([ "id", "text", "class", "temp", "created", "updated" ]);

		$this->assertSame(preg_replace("/\s+/", " ", $query), $expected_query);
		$this->assertSame($result, $expected_result);
	}

	function provider_load() {
		return [
			"default" => [
				"data" => [
					"id" => 42,
					"text" => "",
					"class" => "normal",
					"temp" => "YES",
					"created" => 0,
					"updated" => 0
				],

				"query" => "SELECT *, unix_timestamp(created) AS created, unix_timestamp(updated) AS updated FROM text WHERE id = 42",

				"result" => [
					"id" => 42,
					"text" => "",
					"class" => "normal",
					"temp" => "YES",
					"created" => 0,
					"updated" => 0
				]
			]
		];
	}

	/**
	 * @covers \Funny\Model\Text::save
	 * @covers \Funny\Model\Model::get
	 * @dataProvider provider_save
	 */
	function test_save($data, $expected) {
		$text = $this->getMockBuilder(Text::class)
			->disableOriginalConstructor()
			->setMethods([ "pass" ])
			->getMock();

		$db = $this->getMockBuilder(Connection::class)
			->disableOriginalConstructor()
			->setMethods([ "prepare", "lastInsertId" ])
			->getMock();

		$statm = $this->getMockBuilder(PDOStatement::class)
			->disableOriginalConstructor()
			->setMethods([ "execute" ])
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
				$search = array_keys($binds);
				$search = preg_replace("/^/", ":", $search);
				$replace = array_values($binds);
				$query = str_replace($search, $replace, $query);
			}));

		$text->db = $db;
		$text->set($data);
		$text->save();

		$this->assertSame(preg_replace("/\s+/", " ", $query), $expected);
	}

	function provider_save() {
		return [
			"insert" => [
				"data" => [
					"text" => "text",
					"class" => "normal",
					"temp" => "YES"
				],

				"query" => "INSERT INTO text SET text=text,class=normal,temp=YES"
			],

			"update" => [
				"data" => [
					"id" => 42,
					"text" => "text",
					"class" => "normal",
					"temp" => "YES"
				],

				"query" => "UPDATE text SET text=text,class=normal,temp=YES WHERE id = 42"
			]
		];
	}

	/**
	 * @covers \Funny\Model\Text::del
	 * @dataProvider provider_del
	 */
	function test_del($data, $expected) {
		$text = $this->getMockBuilder(Text::class)
			->disableOriginalConstructor()
			->setMethods([ "pass" ])
			->getMock();

		$db = $this->getMockBuilder(Connection::class)
			->disableOriginalConstructor()
			->setMethods([ "prepare" ])
			->getMock();

		$statm = $this->getMockBuilder(PDOStatement::class)
			->disableOriginalConstructor()
			->setMethods([ "execute" ])
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

		$text->db = $db;
		$text->set($data);
		$text->del();

		$this->assertSame(preg_replace("/\s+/", " ", $query), $expected);
	}

	function provider_del() {
		return [
			"default" => [
				"data" => [ "id" => 42 ],
				"query" => "DELETE FROM text WHERE id = 42",
			]
		];
	}

}
