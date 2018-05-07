<?php

namespace Funny\Model;

class Page extends Model {

	/**
	 * Loads all pages from db
	 * @return array of Page
	 */
	function all() {
		$query = "SELECT *,
			unix_timestamp(created) AS created,
			unix_timestamp(updated) AS updated
			FROM page";

		$statm = $this->db->prepare($query);
		$statm->execute();
		$result = $statm->fetchAll();

		$pages = [];
		foreach ($result as $data) {
			$page = $this->container->get(self::class);
			$page->set($data);
			$pages[] = $page;
		}

		return $pages;
	}

	/**
	 * Loads one page entity from db
	 * @param int $id page identifier
	 */
	function load(int $id) {
		$query = "SELECT *,
			unix_timestamp(created) AS created,
			unix_timestamp(updated) AS updated
			FROM page WHERE id = ?";

		$statm = $this->db->prepare($query);
		$statm->execute([ $id ]);
		$this->set($statm->fetch());
	}

	/**
	 * Saves current page values to db
	 * @return void
	 */
	function save() {
		$insert = "INSERT INTO page SET %s";
		$update = "UPDATE page SET %s WHERE id = :id";
		$values = "link=:link,normal=:normal,positive=:positive,negative=:negative,rremove=:rremove,recurrence=:recurrence";

		$mode = empty($this->id) ? $insert : $update;
		$query = sprintf($mode, $values);

		$binds = empty($this->id) ? [] : [ "id" => $this->id ];
		$binds += $this->get([ "link", "normal", "positive", "negative", "rremove", "recurrence" ]);

		$statm = $this->db->prepare($query);
		$statm->execute($binds);

		if (empty($this->id)) {
			$this->id = $this->db->lastInsertId();
		}
	}

	/**
	 * Deletes data of page from database
	 * @return void
	 */
	function del() {
		if (!empty($this->id)) {
			$query = "DELETE FROM page WHERE id = ?";
			$statm = $this->db->prepare($query);
			$statm->execute([ $this->id ]);
		}
	}

}
