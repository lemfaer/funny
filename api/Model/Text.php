<?php

namespace Funny\Model;

class Text extends Model {

	/**
	 * Loads all texts from db
	 * @return array of Text
	 */
	function all() {
		$query = "SELECT *,
			unix_timestamp(created) AS created,
			unix_timestamp(updated) AS updated
			FROM text";

		$statm = $this->db->prepare($query);
		$statm->execute();
		$result = $statm->fetchAll();

		$texts = [];
		foreach ($result as $data) {
			$text = $this->container->get(self::class);
			$text->set($data);
			$texts[] = $text;
		}

		return $texts;
	}

	/**
	 * Loads one text entity from db
	 * @param int $id text identifier
	 */
	function load(int $id) {
		$query = "SELECT *,
			unix_timestamp(created) AS created,
			unix_timestamp(updated) AS updated
			FROM text WHERE id = ?";

		$statm = $this->db->prepare($query);
		$statm->execute([ $id ]);
		$this->set($statm->fetch());
	}

	/**
	 * Saves current text values to db
	 * @return void
	 */
	function save() {
		$insert = "INSERT INTO text SET %s";
		$update = "UPDATE text SET %s WHERE id = :id";
		$values = "text=:text,class=:class,temp=:temp";

		$mode = empty($this->id) ? $insert : $update;
		$query = sprintf($mode, $values);

		$binds = empty($this->id) ? [] : [ "id" => $this->id ];
		$binds += $this->get([ "text", "class", "temp" ]);

		$statm = $this->db->prepare($query);
		$statm->execute($binds);

		if (empty($this->id)) {
			$this->id = $this->db->lastInsertId();
		}
	}

	/**
	 * Deletes data of text from database
	 * @return void
	 */
	function del() {
		if (!empty($this->id)) {
			$query = "DELETE FROM text WHERE id = ?";
			$statm = $this->db->prepare($query);
			$statm->execute([ $this->id ]);
		}
	}

}
