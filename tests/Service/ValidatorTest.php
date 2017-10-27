<?php

namespace Funny\Test\Service;

use PHPUnit\Framework\TestCase;
use Funny\Service\Validator;

class ValidatorTest extends TestCase {

	/**
	 * @covers \Funny\Service\Validator::validate
	 * @covers \Funny\Service\Validator::link
	 * @covers \Funny\Service\Validator::normal
	 * @covers \Funny\Service\Validator::positive
	 * @covers \Funny\Service\Validator::negative
	 * @covers \Funny\Service\Validator::text
	 * @covers \Funny\Service\Validator::class
	 * @covers \Funny\Service\Validator::temp
	 * @dataProvider provider_validate
	 */
	function test_validate($data, $expected) {
		$validator = $this->getMockBuilder(Validator::class)
			->disableOriginalConstructor()
			->setMethods([ "pass" ])
			->getMock();

		$result = $validator->validate($data);
		$this->assertSame($expected, $result);
	}

	function provider_validate() {
		return [
			"valide" => [
				"data" => [
					"link" => "http://example.com",
					"normal" => null,
					"positive" => "span.hello > p",
					"negative" => null,
					"text" => "test",
					"class" => "normal",
					"temp" => "YES"
				],

				"result" => true
			],

			"invalide" => [
				"data" => [
					"link" => "test",
					"normal" => "",
					"positive" => "",
					"negative" => "",
					"text" => null,
					"class" => "text",
					"temp" => true
				],

				"result" => false
			]
		];
	}

}
