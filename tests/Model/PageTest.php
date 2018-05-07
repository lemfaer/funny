<?php

namespace Funny\Test\Model;

use PHPUnit\Framework\TestCase;
use Funny\Service\{Connection, Container};
use Funny\Model\Page;

class PageTest extends TestCase {

	/**
	 * @covers \Funny\Model\Page::all
	 * @covers \Funny\Model\Model::set
	 * @dataProvider provider_all
	 */
	function test_all($data, $expected_query, $expected_result) {
		$page = $this->getMockBuilder(Page::class)
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

		$page->db = $db;
		$page->container = new Container();
		$page->container[Page::class] = $page;

		$result = $page->all();
		$result = array_shift($result);
		$result = $result->get([ "id", "link", "normal", "positive", "negative", "rremove", "recurrence" ]);

		$this->assertSame(preg_replace("/\s+/", " ", $query), $expected_query);
		$this->assertSame($result, $expected_result);
	}

	function provider_all() {
		return [
			"default" => [
				"data" => [[
					"id" => 1,
					"link" => "http://example.com",
					"normal" => null,
					"positive" => null,
					"negative" => null,
					"rremove" => null,
					"recurrence" => null
				]],
				"query" => "SELECT *, unix_timestamp(created) AS created, unix_timestamp(updated) AS updated FROM page",
				"result" => [
					"id" => 1,
					"link" => "http://example.com",
					"normal" => null,
					"positive" => null,
					"negative" => null,
					"rremove" => null,
					"recurrence" => null
				]
			]
		];
	}

	/**
	 * @covers \Funny\Model\Page::load
	 * @covers \Funny\Model\Model::set
	 * @dataProvider provider_load
	 */
	function test_load($data, $expected_query, $expected_result) {
		$page = $this->getMockBuilder(Page::class)
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

		$page->db = $db;
		$page->load($data["id"]);
		$result = $page->get([ "id", "link", "normal", "positive",
			"negative", "rremove", "recurrence", "created", "updated" ]);

		$this->assertSame(preg_replace("/\s+/", " ", $query), $expected_query);
		$this->assertSame($result, $expected_result);
	}

	function provider_load() {
		return [
			"default" => [
				"data" => [
					"id" => 42,
					"link" => "http://example.com",
					"normal" => null,
					"positive" => null,
					"negative" => null,
					"rremove" => null,
					"recurrence" => null,
					"created" => 0,
					"updated" => 0
				],

				"query" => "SELECT *, unix_timestamp(created) AS created, unix_timestamp(updated) AS updated FROM page WHERE id = 42",

				"result" => [
					"id" => 42,
					"link" => "http://example.com",
					"normal" => null,
					"positive" => null,
					"negative" => null,
					"rremove" => null,
					"recurrence" => null,
					"created" => 0,
					"updated" => 0
				]
			]
		];
	}

	/**
	 * @covers \Funny\Model\Page::save
	 * @covers \Funny\Model\Model::get
	 * @dataProvider provider_save
	 */
	function test_save($data, $expected) {
		$page = $this->getMockBuilder(Page::class)
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

		$page->db = $db;
		$page->set($data);
		$page->save();

		$this->assertSame(preg_replace("/\s+/", " ", $query), $expected);
	}

	function provider_save() {
		return [
			"insert" => [
				"data" => [
					"link" => "'http://example.com'",
					"normal" => "NULL",
					"positive" => "NULL",
					"negative" => "NULL",
					"rremove" => "NULL",
					"recurrence" => "NULL"
				],

				"query" => "INSERT INTO page SET link='http://example.com',normal=NULL,positive=NULL,negative=NULL,rremove=NULL,recurrence=NULL"
			],

			"update" => [
				"data" => [
					"id" => 42,
					"link" => "'http://example.com'",
					"normal" => "NULL",
					"positive" => "NULL",
					"negative" => "NULL",
					"rremove" => "NULL",
					"recurrence" => "NULL"
				],

				"query" => "UPDATE page SET link='http://example.com',normal=NULL,positive=NULL,negative=NULL,rremove=NULL,recurrence=NULL WHERE id = 42"
			]
		];
	}

	/**
	 * @covers \Funny\Model\Page::del
	 * @dataProvider provider_del
	 */
	function test_del($data, $expected) {
		$page = $this->getMockBuilder(Page::class)
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

		$page->db = $db;
		$page->set($data);
		$page->del();

		$this->assertSame(preg_replace("/\s+/", " ", $query), $expected);
	}

	function provider_del() {
		return [
			"default" => [
				"data" => [ "id" => 42 ],
				"query" => "DELETE FROM page WHERE id = 42",
			]
		];
	}

}
