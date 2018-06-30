<?php

namespace Funny\Controller;
use Funny\Model\Launch as Model;
use Funny\Model\Stats;

class Launch extends Controller {

	var $flaunch = [ "id", "type", "report", "weights", "created", "updated" ];
	var $fstats = [ "id", "type", "launch_id", "time", "eta", "info", "created", "updated" ];

	/** GET /launches/{limit},{offset} */
	function all(Model $launch, int $limit, int $offset = 0) {
		$result = [];
		foreach ($launch->all($limit, $offset) as $launch) {
			$result[] = $launch->get($this->flaunch);
		}

		return json_encode($result);
	}

	/** GET /launch/{id} */
	function get(Model $launch, int $id) {
		$this->safe([ $launch, "load" ], $id);
		$result = $launch->get($this->flaunch);
		$result = json_encode($result);
		return $result;
	}

	/** GET /launch/{type} */
	function last(Model $launch, $type) {
		$this->safe([ $launch, "last" ], $type);
		$result = $launch->get($this->flaunch);
		$result = json_encode($result);
		return $result;
	}

	/** GET /eta/{lid} */
	function eta(Stats $stats, int $lid) {
		$this->safe([ $stats, "last" ], $lid);
		$result  = $stats->get($this->fstats);
		$result = json_encode($result);
		return $result;
	}

}
