# setup-roles.ps1
$SUPABASE_URL     = "https://lookscjdmgoumfxjzzpy.supabase.co"
$SERVICE_ROLE_KEY = "PASTE_YOUR_sb_secret_KEY_HERE"

$headers = @{
  "apikey"        = $SERVICE_ROLE_KEY
  "Authorization" = "Bearer $SERVICE_ROLE_KEY"
  "Content-Type"  = "application/json"
  "Prefer"        = "resolution=merge-duplicates,return=representation"
}

Write-Host "`n=== Profiles ===" -ForegroundColor Cyan
$profiles = @(
  @{ id = "yonasmolla3@gmail.com";  email = "yonasmolla3@gmail.com";  full_name = "Yonas M.";   role = "admin"   },
  @{ id = "tamrat@quantum.et";      email = "tamrat@quantum.et";      full_name = "Tamrat M.";  role = "teacher" },
  @{ id = "selam@quantum.et";       email = "selam@quantum.et";       full_name = "Selam M.";   role = "student" },
  @{ id = "birhanu@quantum.et";     email = "birhanu@quantum.et";     full_name = "Birhanu M."; role = "student" }
)
foreach ($p in $profiles) {
  $body = $p | ConvertTo-Json -Compress
  try {
    Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/profiles" -Headers $headers -Method Post -Body $body | Out-Null
    Write-Host "  OK  $($p.email) [$($p.role)]" -ForegroundColor Green
  } catch {
    Write-Host "  FAIL $($p.email): $($_.Exception.Message)" -ForegroundColor Red
  }
}

Write-Host "`n=== Teacher Assignments ===" -ForegroundColor Cyan
$assignments = @(
  @{ teacher_id = "tamrat@quantum.et"; subject = "Chemistry"; grade = "Grade 9" },
  @{ teacher_id = "tamrat@quantum.et"; subject = "Chemistry"; grade = "Grade 10" }
)
foreach ($a in $assignments) {
  $body = $a | ConvertTo-Json -Compress
  try {
    Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/teacher_assignments" -Headers $headers -Method Post -Body $body | Out-Null
    Write-Host "  OK  $($a.teacher_id) - $($a.subject) $($a.grade)" -ForegroundColor Green
  } catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
  }
}

Write-Host "`n=== Student Enrollments ===" -ForegroundColor Cyan
$enrollments = @(
  @{ student_id = "selam@quantum.et";   subject = "Chemistry"; grade = "Grade 9" },
  @{ student_id = "birhanu@quantum.et"; subject = "Chemistry"; grade = "Grade 9" }
)
foreach ($e in $enrollments) {
  $body = $e | ConvertTo-Json -Compress
  try {
    Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/student_enrollments" -Headers $headers -Method Post -Body $body | Out-Null
    Write-Host "  OK  $($e.student_id) - $($e.subject) $($e.grade)" -ForegroundColor Green
  } catch {
    Write-Host "  FAIL: $($_.Exception.Message)" -ForegroundColor Red
  }
}

Write-Host "`n=== Verify ===" -ForegroundColor Cyan
foreach ($t in @("profiles", "teacher_assignments", "student_enrollments")) {
  $r = Invoke-RestMethod -Uri "$SUPABASE_URL/rest/v1/$t?select=*" -Headers $headers -Method Get
  Write-Host "`n$t ($($r.Count) rows)" -ForegroundColor Yellow
  $r | Format-Table -AutoSize
}

Write-Host "`nDONE" -ForegroundColor Green