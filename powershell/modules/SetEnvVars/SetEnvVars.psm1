function IsStrInEnvVar($envVarStr, $checkStr) {
  $arr = $envVarStr.Split(';')
  foreach ($val in $arr) {
    if ($val -eq $checkStr) { return $true }
  }
  return $false
}

function SetEnvVar($envVarName, $valToSet, $scope = "User", $autoCreate = $false, $overwrite = $false, $appendTop = $true) {
  $envVarVals = [Environment]::GetEnvironmentVariable($envVarName, $scope)

  if ($null -eq $envVarVals) {
    if ($autocreate) {
      [Environment]::SetEnvironmentVariable($envVarName, $valToSet, $scope)
      Write-Host "$scope environment variable $envVarName has been set to $valToSet."
      return $true
    }
    $title = "Create and set environment variable $envVarName"
    $question = "$envVarName does not exist in the scope $scope. Create it and set it to $valToSet ?"
    $choices = '&Yes', '&No'

    $decision = $Host.UI.PromptForChoice($title, $question, $choices, 1)
    if ($decision -eq 0) {
      [Environment]::SetEnvironmentVariable($envVarName, $valToSet, $scope)
      Write-Host "$scope environment variable $envVarName has been set to $valToSet."
      return $true
    }
    Write-Host 'Cancelled'
    return $false
  }

  if ($overwrite) {
    [Environment]::SetEnvironmentVariable($envVarName, $valToSet, $scope)
    Write-Host "Value in $scope environment variable $envVarName has been overwritten with $valToSet"
    return $true
  }

  if (IsStrInEnvVar $envVarVals $valToSet) {
    Write-Host "The environment variable $envVarName already contains $valToSet"
    return $false
  }

  if ($appendTop) { $newVals = "$valToSet;$envVarVals" }
  else { $newVals = "$envVarVals;$valToSet" }
  [Environment]::SetEnvironmentVariable($envVarName, $newVals, $scope)
  Write-Host "$valToSet has been added to $scope environment variable $envVarName."
  return $true
}

function Test() {
  Write-Host $PSScriptRoot
}

