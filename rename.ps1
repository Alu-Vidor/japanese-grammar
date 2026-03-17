Get-ChildItem "src\assets\lessons\*_bg_*.png" | Rename-Item -NewName { $_.Name -replace '_\d+\.png','.png' }
