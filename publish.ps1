# Mirror the local skill into this repo, validate the plugin, rebuild the share zip.
# Then: bump "version" in .claude-plugin/plugin.json, commit and push.
$ErrorActionPreference = "Stop"
$src = "$env:USERPROFILE\.claude\skills\killer-video"
robocopy $src "$PSScriptRoot\skills\killer-video" /MIR /NFL /NDL /NJH /NJS | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy failed (exit $LASTEXITCODE)" }
claude plugin validate --strict $PSScriptRoot
if ($LASTEXITCODE -ne 0) { throw "plugin validation failed" }
& "$env:SystemRoot\System32\tar.exe" -a -c -f "$env:USERPROFILE\Desktop\killer-video-skill.zip" -C "$env:USERPROFILE\.claude\skills" killer-video
"Synced, validated, zip rebuilt. Next: bump the version in .claude-plugin/plugin.json, commit, push."
