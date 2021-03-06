<?php

// File that stores all the JSON data
$filename = "settings.json";

$requestMethod = $_SERVER["REQUEST_METHOD"];

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');

if ($requestMethod == "GET") {
    header("Content-type: application/json");
    // File doesnt exist
    if (!file_exists($filename)) {

        echo "{}";
        exit(0);
    }
    // Fetch contents from file
    $json = file_get_contents($filename);
    // Output header for browsers
    // The actual content of the file as JSON
    echo "$json";
    // Stop the script from continuing
    exit(0);
}

if ($requestMethod == "POST") {
    // Decode the JSON data we got
    $json = json_decode(file_get_contents('php://input'));

    // Store everything in our file
    file_put_contents($filename, json_encode($json));

    exit(0);
}

?>
