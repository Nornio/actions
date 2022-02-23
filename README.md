## JIRA actions

### Check pull request title for JIRA reference

`Nornio/actions/jira/check-pr-action@v1.0.0`

This action lets you require that the pull request title contains a JIRA key to an existing JIRA issue.

Example usage: 

```yml
name: Check PR rules

on:
    pull_request:
        types: [opened, reopened, edited, synchronize]

jobs:
    check-pr-rules:
        runs-on: ubuntu-latest
        steps:
            # JIRA Issue check
            - uses: Nornio/actions/jira/check-pr-action@v1.0.0
              with:
                  host: myhost.atlassian.net
                  project-key: MYPROJ
                  bypass-prefix: "[NOJIRA]"
              env:
                  JIRAEMAIL: ${{ secrets.JIRA_MAIL }}
                  JIRATOKEN: ${{ secrets.JIRA_TOKEN }}
```
_Requirements: Create a API Token in jira and set the JIRAEMAIL and JIRATOKEN env_

### Create JIRA version

This action lets you find or create a JIRA version (release) and assign fix-version to JIRA Issues referenced in the change log.

`Nornio/actions/jira/release-action@v1.0.0`

Example usage:

```yml
  # Steps to do git tag/release and to create a changelog is not part of this example
  .
  .
  .

  # JIRA Release
  - uses: Nornio/actions/jira/release-action@v1.0.0
    id: jiraRelease
    with:
        host: myhost.atlassian.net
        project-key: MYPROJ
        release-name: My Product ${{ new_version }}
        release-description: "One excellent release"
        release-changelog: ${{ changelog_possibly_containing_jira_references }}
    env:
        JIRAEMAIL: ${{ secrets.JIRA_MAIL }}
        JIRATOKEN: ${{ secrets.JIRA_TOKEN }}
```
_Requirements: Create a API Token in jira and set the JIRAEMAIL and JIRATOKEN env_

If the changelog contains texts that matches one or several existing JIRA issues (for example: MYPROJ-123) The JIRA version will be appended to those issue's fix-version.

