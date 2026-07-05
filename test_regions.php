<?php
$regions = [
    'ap-southeast-3', // Jakarta
    'ap-southeast-1', // Singapore
    'us-east-1',
    'us-west-1',
    'eu-west-1',
    'eu-central-1',
    'ap-southeast-2',
    'ap-northeast-1',
    'ap-south-1',
    'sa-east-1',
];

$password = 'Lx*Q@HKN$akf56L';
$projectId = 'qimortzhyllggwlrfzdx';
$username = 'postgres.' . $projectId;
$dbname = 'postgres';

foreach ($regions as $region) {
    $host = "aws-0-{$region}.pooler.supabase.com";
    echo "Testing {$host}... ";
    
    // We try port 6543 (transaction)
    $dsn = "pgsql:host={$host};port=6543;dbname={$dbname}";
    try {
        $pdo = new PDO($dsn, $username, $password, [PDO::ATTR_TIMEOUT => 2]);
        echo "SUCCESS on port 6543!\n";
        file_put_contents('found_host.txt', "{$host}:6543");
        exit(0);
    } catch (Exception $e) {
        // try 5432 (session)
        $dsn = "pgsql:host={$host};port=5432;dbname={$dbname}";
        try {
            $pdo = new PDO($dsn, $username, $password, [PDO::ATTR_TIMEOUT => 2]);
            echo "SUCCESS on port 5432!\n";
            file_put_contents('found_host.txt', "{$host}:5432");
            exit(0);
        } catch (Exception $e2) {
            echo "FAILED\n";
        }
    }
}
echo "NOT FOUND\n";
