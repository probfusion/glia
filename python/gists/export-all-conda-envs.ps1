# I have various bash utilities installed from scoop. 
# `cut -d" " -f1` powershell equivalent is `Foreach-Object { $_.split(' ')[2] }`
mamba env list | 
Foreach-Object { $_.split(' ')[0] } | 
Where-Object {$_ -notmatch '^#?$'} | 
Foreach-Object { 
    $exportDir = 'C:/cloud/git/probhub/conda-mamba-environments/';
    conda activate $_
    mamba update pip -y
    conda env export -n $_ > $exportDir\$_.yml; 
    conda env export --from-history -n $_ > $exportDir\$_-manual.yml
}

# to update a single environment edit the match
mamba env list | 
Foreach-Object { $_.split(' ')[0] } | 
Where-Object {$_ -match 'py9'} | 
Foreach-Object { 
    $exportDir = 'C:/cloud/git/probhub/conda-mamba-environments/';
    conda activate $_
    mamba update pip -y
    conda env export -n $_ > $exportDir\$_.yml; 
    conda env export --from-history -n $_ > $exportDir\$_-manual.yml
}