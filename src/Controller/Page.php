<?php

namespace Funny\Controller;

use Exception;
use Funny\Model\Page as Model;

class Page extends Controller {

	var $fields = [ "id", "link", "normal", "positive", "negative", "created", "updated" ];

	/** GET /pages */
	function all(Model $page) {
		$result = [];
		foreach ($page->all() as $page) {
			$result[] = $page->get($this->fields);
		}

		return json_encode($result);
	}

	/** GET /page/{id} */
	function get(Model $page, int $id) {
		$this->safe([ $page, "load" ], $id);
		$result = $page->get($this->fields);
		$result = json_encode($result);
		return $result;
	}

	/** POST /page/{id} */
	function save(Model $page, int $id = 0) {
		if (!empty($id)) {
			$this->safe([ $page, "load" ], $id);
		}

		$data = $this->input();
		if (!$this->validator->validate($data)) {
			throw new Exception("Wrong data", 400);
		}

		$page->set($data);
		$page->save();
	}

	/** DELETE /page/{id} */
	function del(Model $page, int $id) {
		$this->safe([ $page, "load" ], $id);
		$page->del();
	}

}
