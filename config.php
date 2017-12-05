<?php

return [

	"app" => [
		"domain" => $_SERVER["HTTP_HOST"],
		"root" => __DIR__,
		"src" => __DIR__ . "/src",
		"tests" => __DIR__ . "/tests"
	],

	"db" => [
		"host" => "127.0.0.1",
		"base" => "sal",
		"user" => "root",
		"pass" => "",
		"options" => [
			\PDO::MYSQL_ATTR_INIT_COMMAND => "set names utf8",
			\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION,
			\PDO::ATTR_DEFAULT_FETCH_MODE => \PDO::FETCH_ASSOC
		]
	],

	"routes" => [
		[ "GET", "~^launches/([0-9]+),?([0-9]+)?$~", [ \Funny\Controller\Launch::class, "all" ] ],
		[ "GET", "~^launch/([0-9]+)$~", [ \Funny\Controller\Launch::class, "get" ] ],
		[ "GET", "~^launch/([a-z]+)$~", [ \Funny\Controller\Launch::class, "last" ] ],
		[ "GET", "~^eta/([0-9]+)$~", [ \Funny\Controller\Launch::class, "eta" ] ],

		[ "GET",  "~^pages$~", [ \Funny\Controller\Page::class, "all" ] ],
		[ "GET",  "~^page/([0-9])+$~", [ \Funny\Controller\Page::class, "get" ] ],
		[ "POST", "~^page/?([0-9]+)?$~", [ \Funny\Controller\Page::class, "save" ] ],
		[ "DELETE", "~^page/([0-9]+)$~", [ \Funny\Controller\Page::class, "del" ] ],

		[ "GET",  "~^texts$~", [ \Funny\Controller\Text::class, "all" ] ],
		[ "GET",  "~^text/([0-9]+)$~", [ \Funny\Controller\Text::class, "get" ] ],
		[ "POST", "~^text/?([0-9]+)?$~", [ \Funny\Controller\Text::class, "save" ] ],
		[ "DELETE", "~^text/([0-9]+)$~", [ \Funny\Controller\Text::class, "del" ] ]
	]

];
