<?php

ini_set("display_errors", 1);
ini_set("display_startup_errors", 1);
error_reporting(E_ALL);

require __DIR__ . "/vendor/autoload.php";
require __DIR__ . "/container.php";

header("Content-Type: application/json");
$uri = trim($_SERVER["REQUEST_URI"], "/");
$method = $_SERVER["REQUEST_METHOD"];

$handler = $container->get(\Funny\Service\Handler::class);
$handler->register();

$router = $container->get(\Funny\Service\Router::class);
[ $func, $args ] = $router->dispatch($method, $uri);

echo $container->call($func, ...$args);
