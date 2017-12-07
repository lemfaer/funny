<?php

namespace Funny\Model;

class Launch extends Model {

	/**
	 * Loads all launches data from db
	 * @param int $limit count of rows
	 * @param int $offset count of rows to skip
	 * @return array of Page
	 */
	function all(int $limit, int $offset) {
		$query = "SELECT *,
			unix_timestamp(created) AS created,
			unix_timestamp(updated) AS updated
			FROM launch ORDER BY id DESC
			LIMIT $limit OFFSET $offset";

		$statm = $this->db->prepare($query);
		$statm->execute();
		$result = $statm->fetchAll();

		$launches = [];
		foreach ($result as $data) {
			$launch = $this->container->get(self::class);
			$launch->set($data);
			$launches[] = $launch;
		}

		return $launches;
	}

	/**
	 * Loads launch data from db
	 * @param int $id launch id
	 */
	function load(int $id) {
		$query = "SELECT *,
			unix_timestamp(created) AS created,
			unix_timestamp(updated) AS updated
			FROM launch WHERE id = ?";

		$statm = $this->db->prepare($query);
		$statm->execute([ $id ]);
		$this->set($statm->fetch());
	}

	/**
	 * Loads last launch data from db
	 * @return void
	 */
	function last($type) {
		$query = "SELECT *,
			unix_timestamp(created) AS created,
			unix_timestamp(updated) AS updated
			FROM launch
			WHERE id = (SELECT max(id) FROM launch WHERE type = ?)";

		$statm = $this->db->prepare($query);
		$statm->execute([ $type ]);
		$this->set($statm->fetch());
	}

}
