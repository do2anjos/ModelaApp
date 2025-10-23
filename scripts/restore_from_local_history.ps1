$ErrorActionPreference = 'Stop'

# Configurações
$targetDate = Get-Date '2025-10-22 23:39:00'
$workspaceRoot = (Get-Location).Path

# Extensões alvo (pode ajustar se necessário)
$extensions = @('*.html','*.css','*.js')

# Raízes de histórico comuns do VS Code / Cursor (construídas com segurança)
$historyRoots = @()
$p1 = Join-Path $env:APPDATA 'Code\User\History'
$p2 = Join-Path $env:APPDATA 'Cursor\User\History'
$p3 = Join-Path $env:APPDATA 'Code\User\workspaceStorage'
$p4 = Join-Path $env:APPDATA 'Cursor\User\workspaceStorage'
foreach ($p in @($p1,$p2,$p3,$p4)) { if ($p -and (Test-Path $p)) { $historyRoots += $p } }

if (-not $historyRoots -or $historyRoots.Count -eq 0) {
  Write-Host 'Nenhum diretório de histórico local encontrado (VS Code/Cursor).'
  Write-Host 'Restaure manualmente pela Timeline da IDE ou Versões Anteriores do Windows.'
  exit 1
}

# Pasta de backup e relatório
$stamp = (Get-Date).ToString('yyyyMMdd_HHmmss')
$backupDir = Join-Path $workspaceRoot ("_backup_before_restore_"+$stamp)
$report = Join-Path $workspaceRoot ("_restore_report_"+$stamp+".txt")
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
"Restauro iniciado em $(Get-Date -Format 'u') para alvo $($targetDate)" | Out-File -FilePath $report -Encoding UTF8
"Workspace: $workspaceRoot" | Out-File -FilePath $report -Append -Encoding UTF8
"HistoryRoots:`n$($historyRoots -join "`n")" | Out-File -FilePath $report -Append -Encoding UTF8

function Find-NearestSnapshot([string]$nameOnly) {
  $candidates = @()
  foreach ($root in $historyRoots) {
    try {
      $candidates += Get-ChildItem -Path $root -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { $_.Name -like ("*"+$nameOnly+"*") }
    } catch {}
  }
  if (-not $candidates -or $candidates.Count -eq 0) { return $null }
  $candidates | Sort-Object { [math]::Abs( ($_.LastWriteTime - $targetDate).TotalSeconds ) } | Select-Object -First 1
}

# Lista de arquivos alvo no workspace
$workspaceFiles = @()
foreach ($ext in $extensions) {
  $workspaceFiles += Get-ChildItem -Path $workspaceRoot -Recurse -File -Include $ext -ErrorAction SilentlyContinue
}

if (-not $workspaceFiles -or $workspaceFiles.Count -eq 0) {
  Write-Host 'Nenhum arquivo alvo (*.html, *.css, *.js) encontrado no workspace.'
  exit 1
}

"Total de arquivos alvo no workspace: $($workspaceFiles.Count)" | Out-File -FilePath $report -Append -Encoding UTF8

$restored = 0
$notFound = 0

foreach ($file in $workspaceFiles) {
  $relativePath = ($file.FullName).Substring($workspaceRoot.Length).TrimStart('\')
  $nameOnly = $file.Name

  $snapshot = Find-NearestSnapshot $nameOnly
  if (-not $snapshot) {
    "NÃO ENCONTRADO snapshot para $relativePath" | Tee-Object -FilePath $report -Append | Out-Null
    $notFound++
    continue
  }

  # Backup do arquivo atual
  try {
    $backupPath = Join-Path $backupDir ($relativePath -replace '[\\/:*?""<>|]', '_')
    $backupParent = Split-Path $backupPath -Parent
    New-Item -ItemType Directory -Path $backupParent -Force | Out-Null
    Copy-Item -Path $file.FullName -Destination $backupPath -Force
  } catch {}

  # Restaurar
  try {
    $destParent = Split-Path $file.FullName -Parent
    New-Item -ItemType Directory -Path $destParent -Force | Out-Null
    Copy-Item -Path $snapshot.FullName -Destination $file.FullName -Force
    "OK: $relativePath <= $($snapshot.FullName) (LastWriteTime=$($snapshot.LastWriteTime))" | Tee-Object -FilePath $report -Append | Out-Null
    $restored++
  } catch {
    "ERRO ao restaurar $relativePath de $($snapshot.FullName): $($_.Exception.Message)" | Tee-Object -FilePath $report -Append | Out-Null
  }
}

"Concluído. Restaurados: $restored | Sem snapshot: $notFound" | Tee-Object -FilePath $report -Append | Out-Null
"Backup atual: $backupDir" | Tee-Object -FilePath $report -Append | Out-Null
"Relatório: $report" | Tee-Object -FilePath $report -Append | Out-Null

Write-Host "Restauro finalizado. Veja o relatório em: $report"


