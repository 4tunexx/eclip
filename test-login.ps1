$email = "airijuz@gmail.com"
$password = "Rojus1990"
$url = "http://localhost:9002/api/auth/login"

Write-Host "Testing Login API..."

$body = @{
    email = $email
    password = $password
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri $url -Method POST -Headers @{"Content-Type"="application/json"} -Body $body

Write-Host "Status: $($response.StatusCode)"
Write-Host "Body: $($response.Content)"
Write-Host "Set-Cookie Header:"
$response.Headers["Set-Cookie"]
