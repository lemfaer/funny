<?php

namespace Funny\Model;

class Stats extends Model {

	/**
	 * Loads last stats data from db
	 * @param int $lid launch identifier
	 */
	function last(int $lid) {
		$query = "SELECT *,
			unix_timestamp(created) AS created,
			unix_timestamp(updated) AS updated
			FROM stats
			WHERE id = (SELECT max(id) FROM stats WHERE launch_id = ?)";

		$statm = $this->db->prepare($query);
		$statm->execute([ $lid ]);
		$this->set($statm->fetch());
	}

}
