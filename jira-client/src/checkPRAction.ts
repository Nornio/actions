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

        //Get the JSON webhook payload for the event that triggered the workflow
        const payload = JSON.stringify(github.context.payload, undefined, 2);
        const test = github?.context?.payload?.pull_request?.title || "";
        console.log(`Checking ${test}`);
        const result = await client.checkTextForJiras(test);

        if (result.length == 0) {
            console.log(
                "FAIL: Could not find any reference to a jira issue in the title"
            );
            core.setFailed(
                "PR title does not have a JIRA issue mentioned. Please correct this by prefixing the title with a JIRA issue key. If the are no JIRA for this PR prefix the title with NOJIRA"
            );
        } else {
            console.log("Found jiras");
            console.log(result);
        }
    } catch (error) {
        // core.setFailed(error as Error);
        console.log(error);
    }
};

main();
