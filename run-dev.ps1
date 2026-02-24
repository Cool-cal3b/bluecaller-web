$ErrorActionPreference = "Stop"
$Port = 3008

if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#")) {
            $eq = $line.IndexOf("=")
            if ($eq -gt 0) {
                $key = $line.Substring(0, $eq).Trim()
                $value = $line.Substring($eq + 1).Trim()
                if ($value.Length -ge 2 -and $value[0] -eq '"' -and $value[-1] -eq '"') {
                    $value = $value.Substring(1, $value.Length - 2)
                }
                elseif ($value.Length -ge 2 -and $value[0] -eq "'" -and $value[-1] -eq "'") {
                    $value = $value.Substring(1, $value.Length - 2)
                }
                Set-Item -Path "env:$key" -Value $value
            }
        }
    }
}

$url = "http://localhost:$Port"
Start-Job -ScriptBlock {
    param($u)
    Start-Sleep -Seconds 3
    $chrome = "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe"
    if (Test-Path $chrome) {
        Start-Process $chrome -ArgumentList $u
    }
    else {
        Start-Process $u
    }
} -ArgumentList $url | Out-Null

npx next dev -p $Port
