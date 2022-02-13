import * as core from "@actions/core";
import * as github from "@actions/github";
import { JiraClient, VersionInput } from "./JiraClient";

const main = async () => {
    try {
        // env
        const email = process.env.JIRAEMAIL;
        const apiToken = process.env.JIRATOKEN;

        // Inputs
        const host = core.getInput("host");
        const projectkey = core.getInput("project-key");
        const releaseName = core.getInput("release-name");
        const releaseDesciption = core.getInput("release-description");
        const releaseChangelog = core.getMultilineInput("release-changelog");

        const versionInput: VersionInput = {
            changelog: releaseChangelog,
            name: releaseName,
            description: releaseDesciption,
        };

        if (!email) {
            core.setFailed(
                "Missing JIRAEMAIL env variable. Use env: JIRAEMAIL: ${{ secrets.MY_JIRA_MAIL_SECRET }}"
            );
            return;
        }

        if (!apiToken) {
            core.setFailed(
                "Missing JIRATOKEN env variable. Use env: JIRATOKEN: ${{ secrets.MY_JIRATOKEN_SECRET }}"
            );
            return;
        }

        let client = new JiraClient({
            host: host,
            email: email,
            apiToken: apiToken,
            projectKey: projectkey,
        });

        await client.createOrUpdateJiraRelease(versionInput);
    } catch (error) {
        // core.setFailed(error as Error);
        console.log(error);
    }
};

main();
