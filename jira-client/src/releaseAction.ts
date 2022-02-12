import * as core from "@actions/core";
import * as github from "@actions/github";
import { JiraClient, VersionInput } from "./JiraClient";

const main = async () => {
    try {
        // Inputs
        const email = process.env.JIRAEMAIL;
        const apiToken = process.env.JIRATOKEN;

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
            console.log("Missing JIRAEMAIL env");
            return;
        }

        if (!apiToken) {
            console.log("Missing JIRATOKEN env");
            return;
        }

        let client = new JiraClient({
            host: host,
            email: email,
            apiToken: apiToken,
            projectKey: projectkey,
        });

        await client.createOrUpdateJiraRelease(versionInput);

        const time = new Date().toTimeString();
        core.setOutput("time", time);

        // Get the JSON webhook payload for the event that triggered the workflow
        // const payload = JSON.stringify(github.context.payload, undefined, 2);
    } catch (error) {
        // core.setFailed(error as Error);
        console.log(error);
    }
};

main();
