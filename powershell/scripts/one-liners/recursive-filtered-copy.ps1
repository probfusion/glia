# copies all .ico files in current directory to destination.

# -Force copies items that can't otherwise be changed, such as copying over a read-only file or
# alias.
Get-ChildItem -Recurse -Filter *.ico | Foreach-Object { Copy-Item $_.FullName -Destination 'C:\cloud\software\folder-icons\windows-combined' -Force }