New-Item -ItemType Directory -Force -Path "src\assets\characters"
Get-ChildItem "C:\Users\danii\.gemini\antigravity\brain\9b128271-b4b8-4e61-af30-8d211d2286bc\avatar_*.png" | Copy-Item -Destination "src\assets\characters\"
Get-ChildItem "src\assets\characters\avatar_*.png" | Rename-Item -NewName { $_.Name -replace '_\d+\.png','.png' }
