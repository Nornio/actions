import "dotenv/config";
import { Formatting, JiraClient, JiraClientConfig } from "./JiraClient";
import JiraIssueParser from "./JiraIssueParser";

const conf: JiraClientConfig = {
    apiToken: process.env.JIRATOKEN as string,
    email: process.env.JIRAEMAIL as string,
    host: "nornio.atlassian.net",
    projectKey: "NPD",
};

const main = async () => {
    const c = new JiraClient(conf);
    const result = await c.checkTextForExistingJiras("NPD-3, NPD-1");

    // const parser = new JiraIssueParser("NPD");

    // const result = parser.parseIssuesKeysFromLog(["NPD-1,NPD-1", "NPD-2"]);

    console.log(result);

    const f = new Formatting();
    console.log(f.getTodaysDate());
};

main();
