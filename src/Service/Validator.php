<?php

namespace Funny\Service;

class Validator {

	/**
	 * Validate data using validate functions
	 * @param array $data
	 * @return bool
	 */
	function validate(array $data) {
		$result = [];
		foreach ($data as $key => $value) {
			$result[] = $this->$key($value);
		}

		return boolval(array_product($result));
	}

	function link($value) {
		return filter_var($value, FILTER_VALIDATE_URL) !== false;
	}

	function normal($value) {
		return is_null($value) || ( is_string($value) && !empty($value) );
	}

	function positive($value) {
		return is_null($value) || ( is_string($value) && !empty($value) );
	}

	function negative($value) {
		return is_null($value) || ( is_string($value) && !empty($value) );
	}

	function text($value) {
		return is_string($value);
	}

	function class($value) {
		return in_array($value, [ "normal", "positive", "negative" ], true);
	}

	function temp($value) {
		return in_array($value, [ "YES", "NO" ], true);
	}

}
