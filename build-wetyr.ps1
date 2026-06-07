# =====================================================================
#  WETYR Film Intel, iOS cloud build (one-time interactive credential
#  setup, then it queues the build on EAS).
#
#  Uses your App Store Connect API key, so there is NO Apple password and
#  NO 2FA prompt. EAS only asks you to confirm generating a Distribution
#  Certificate and a Provisioning Profile, just answer  Y  to each.
#
#  After it prints  "Build details: https://expo.dev/..."  the build is
#  queued. Tell Claude "build is queued" and Claude monitors it and
#  submits to TestFlight from there.
# =====================================================================

$env:EXPO_ASC_API_KEY_PATH = "C:\Users\13219\Downloads\AuthKey_YRMDQTX998.p8"
$env:EXPO_ASC_KEY_ID       = "YRMDQTX998"
$env:EXPO_ASC_ISSUER_ID    = "b7b9dd56-d867-4b33-b6e0-21e133f8bf12"
$env:EAS_NO_VCS            = "1"
$env:EAS_BUILD_NO_EXPO_GO_WARNING = "true"

Set-Location "C:\Users\13219\Desktop\WETYR-Films"

Write-Host "`n=========  WETYR FILM INTEL (iOS)  =========`n" -ForegroundColor Cyan
Write-Host "Answer Y when asked to generate the Distribution Certificate and Provisioning Profile.`n" -ForegroundColor Yellow

npx eas-cli@latest build --platform ios --profile production --no-wait

Write-Host "`n-------------------------------------------------------------" -ForegroundColor Green
Write-Host "SUCCESS looks like a 'Build details: https://expo.dev/.../builds/<id>' URL above." -ForegroundColor Green
Write-Host "Tell Claude 'build is queued' and Claude takes over (monitor + TestFlight)." -ForegroundColor Green
