$file = "c:\Users\CW\Desktop\drugcheck\data\database.ts"
$lines = Get-Content $file
$duplicates = @()

for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ($line -match "^add\(") {
        $drugLine = $line
        $mechAr = $lines[$i+1].Trim()
        $mechEn = $lines[$i+2].Trim()
        $effAr = $lines[$i+3].Trim()
        $effEn = $lines[$i+4].Trim()
        $manAr = $lines[$i+5].Trim()
        $manEn = $lines[$i+6].Trim()
        
        $issues = @()
        
        # Check if Arabic text is duplicated (same in both AR and EN fields)
        if ($mechAr -match "[\u0600-\u06FF]" -and $mechEn -match "[\u0600-\u06FF]") {
            if ($mechAr.Trim() -eq $mechEn.Trim()) {
                $issues += "Mechanism"
            }
        }
        
        if ($effAr -match "[\u0600-\u06FF]" -and $effEn -match "[\u0600-\u06FF]") {
            if ($effAr.Trim() -eq $effEn.Trim()) {
                $issues += "Effect"
            }
        }
        
        if ($manAr -match "[\u0600-\u06FF]" -and $manEn -match "[\u0600-\u06FF]") {
            if ($manAr.Trim() -eq $manEn.Trim()) {
                $issues += "Management"
            }
        }
        
        if ($issues.Count -gt 0) {
            $drugInfo = $drugLine.Substring(4, [Math]::Min(70, $drugLine.Length - 4))
            $duplicates += [PSCustomObject]@{
                Line = $i + 1
                Fields = $issues -join ", "
                Drug = $drugInfo
                MechAr = $mechAr.Substring(0, [Math]::Min(60, $mechAr.Length))
            }
        }
    }
}

Write-Host "Found $($duplicates.Count) interactions with Arabic text duplicated (not translated to English)" -ForegroundColor Yellow
Write-Host ""
$duplicates | Format-Table Line, Fields, Drug -Wrap

# Save to file
$duplicates | Export-Csv "c:\Users\CW\Desktop\drugcheck\duplicate_translations.csv" -NoTypeInformation -Encoding UTF8
Write-Host ""
Write-Host "Full list saved to: duplicate_translations.csv" -ForegroundColor Green
