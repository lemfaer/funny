<?php

$container = new \Funny\Service\Container();

$container[\Funny\Service\Config::class] = new \Funny\Service\Config(include "config.php");
$container[\Funny\Service\Router::class] = $container->get(\Funny\Service\Router::class);
$container[\Funny\Service\Handler::class] = $container->get(\Funny\Service\Handler::class);
$container[\Funny\Service\Validator::class] = $container->get(\Funny\Service\Validator::class);
$container[\Funny\Service\Connection::class] = $container->get(\Funny\Service\Connection::class);

$container[\Funny\Controller\Page::class] = $container->get(\Funny\Controller\Page::class);
$container[\Funny\Controller\Text::class] = $container->get(\Funny\Controller\Text::class);
