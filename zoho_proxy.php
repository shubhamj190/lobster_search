<?php
// zoho_proxy.php
// Handles secure token rotation and submission to Zoho CRM

// --- CONFIGURATION ---
// Replace these with your actual credentials from Zoho API Console
$clientId = '1000.A3CH4NFIL55R2A4ZAKWM9TT1XGKQNT';
$clientSecret = '8b008114642cdef434b5bc518d101f191123bf0aab';
$refreshToken = '1000.b041575c23d88b016a6ae8b62a390632.9f1f1b6445242d76288378abed9a8817';
// --------------------

// Allow CORS (since fetch comes from browser)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// 1. Get Access Token using Refresh Token (Data Center: IN)
$authUrl = 'https://accounts.zoho.in/oauth/v2/token';
$postData = [
    'refresh_token' => $refreshToken,
    'client_id' => $clientId,
    'client_secret' => $clientSecret,
    'grant_type' => 'refresh_token'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $authUrl);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$authResponse = curl_exec($ch);
curl_close($ch);

$authObj = json_decode($authResponse, true);

if (!isset($authObj['access_token'])) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to obtain access token', 'details' => $authObj]);
    exit;
}

$accessToken = $authObj['access_token'];

// 2. Prepare Data for Zoho CRM
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

// Map frontend fields (if needed) or pass through directly
// Expected structure: { "data": [ { "Last_Name": "...", ... } ] }
// If frontend sends flat object, wrap it:
if (!isset($input['data'])) {
    $crmData = ['data' => [$input]];
} else {
    $crmData = $input;
}

// 3. Submit to Zoho CRM Leads API (Data Center: IN)
$crmUrl = 'https://www.zohoapis.in/crm/v2/Leads'; // Change module if needed

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $crmUrl);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($crmData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Zoho-oauthtoken ' . $accessToken,
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// 4. Return Response to Frontend
http_response_code($httpCode >= 200 && $httpCode < 300 ? 200 : $httpCode);
echo $response;

?>