 = 'src/routes/_protected/dashboard.tsx'
 = Get-Content  -Raw
 = 'const digits = entry.amount.replace(/\[\^[\s\S]*?\]/g, '''')'
 = 'const digits = entry.amount.replace(/[^
\\d]/g, '''')'
 =  -replace , 
Set-Content -Encoding utf8  
