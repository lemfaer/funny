<?php

namespace Funny\Controller;

use Exception;
use Funny\Model\Text as Model;

class Text extends Controller {

	var $fields = [ "id", "text", "class", "temp", "created", "updated" ];

	/** GET /texts */
	function all(Model $text) {
		$result = [];
		foreach ($text->all() as $text) {
			$result[] = $text->get($this->fields);
		}

		return json_encode($result);
	}

	/** GET /text/{id} */
	function get(Model $text, int $id) {
		$this->safe([ $text, "load" ], $id);
		$result = $text->get($this->fields);
		$result = json_encode($result);
		return $result;
	}

	/** POST /text/{id} */
	function save(Model $text, int $id = 0) {
		if (!empty($id)) {
			$this->safe([ $text, "load" ], $id);
		}

		$data = $this->input();
		if (!$this->validator->validate($data)) {
			throw new Exception("Wrong data", 400);
		}

		$text->set($data);
		$text->save();
	}

	/** DELETE /text/{id} */
	function del(Model $text, int $id) {
		$this->safe([ $text, "load" ], $id);
		$text->del();
	}

}
