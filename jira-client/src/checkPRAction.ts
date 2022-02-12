import * as core from "@actions/core";
import * as github from "@actions/github";
import { JiraClient, VersionInput } from "./JiraClient";

const main = async () => {
    try {
        // Env
        const email = process.env.JIRAEMAIL;
        const apiToken = process.env.JIRATOKEN;

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

        // Inputs
        const missingJiraBypassTitlePrefix = core.getInput(
            "missingJiraBypassTitlePrefix",
            { required: false }
        );
        const host = core.getInput("host", { required: true });
        const projectkey = core.getInput("project-key", { required: true });

        // Create the Jira Client
        let client = new JiraClient({
            host: host,
            email: email,
            apiToken: apiToken,
            projectKey: projectkey,
        });

        //Get the JSON webhook payload for the event that triggered the workflow
        const payload = JSON.stringify(github.context.payload, undefined, 2);
        const test: string =
            github?.context?.payload?.pull_request?.title || "";
        console.log(`Checking ${test}`);

        if (
            missingJiraBypassTitlePrefix &&
            test.startsWith(missingJiraBypassTitlePrefix)
        ) {
            console.log(
                `PR title starts with ${missingJiraBypassTitlePrefix} bypassing existing JIRA issue test`
            );
            return;
        }

        const result = await client.checkTextForJiras(test);

        if (result.length == 0) {
            if (missingJiraBypassTitlePrefix) {
                core.setFailed(
                    `Pull-request title does not mention an existing JIRA issue in the project ${projectkey}. Please correct this by prefixing the title with a JIRA issue key i.e. ${projectkey}-1234. If there are no JIRA for this PR you are allowed to bypass this test by prefixing the title with ${missingJiraBypassTitlePrefix}`
                );
            } else {
                core.setFailed(
                    `Pull-request title does not mention an existing JIRA issue in the project ${projectkey}. Please correct this by prefixing the title with a JIRA issue key i.e. ${projectkey}-1234. You can set the missingJiraBypassTitlePrefix input on this action to a string that allows bypassing of this test if set to a prefix to the title of the pull-request`
                );
            }
        } else {
            console.log("Found");
            console.log(result);
        }
    } catch (error) {
        //core.setFailed(`${error}`);
        console.log(error);
    }
};

main();