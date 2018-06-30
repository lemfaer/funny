<?php

namespace Funny\Test\Model;

use PHPUnit\Framework\TestCase;
use Funny\Service\{Connection, Container};
use Funny\Model\Stats;

class StatsTest extends TestCase {

	/**
	 * @covers \Funny\Model\Stats::last
	 * @covers \Funny\Model\Model::set
	 * @dataProvider provider_last
	 */
	function test_last($data, $expected_query, $expected_result) {
		$stats = $this->getMockBuilder(Stats::class)
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
				$lid = array_shift($binds);
				$query = str_replace("?", $lid, $query);
			}));

		$statm->expects($this->once())
			->method("fetch")
			->will($this->returnValue($data));

		$stats->db = $db;
		$stats->last($data["launch_id"]);
		$result = $stats->get([ "id", "type", "launch_id", "time", "eta", "info", "created", "updated" ]);

		$this->assertSame(preg_replace("/\s+/", " ", $query), $expected_query);
		$this->assertSame($result, $expected_result);
	}

	function provider_last() {
		$data = [
			"id" => 14,
			"type" => "parser",
			"launch_id" => 19,
			"time" => "0.353",
			"eta" => 0,
			"info" => '{"eta": 0, "len": "24463", "link": "https://wikipedia.org/wiki/N-gram", "time": 0.3529999256134033, "loaded": 0.2650001049041748, "parsed": 0.08599996566772461}',
			"created" => 0,
			"updated" => 0
		];

		return [
			"default" => [
				"data" => $data,
				"query" => "SELECT *, unix_timestamp(created) AS created, unix_timestamp(updated) AS updated FROM stats WHERE id = (SELECT max(id) FROM stats WHERE launch_id = 19)",
				"result" => $data
			]
		];
	}

}
