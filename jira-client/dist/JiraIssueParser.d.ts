declare class JiraIssueParser {
    private projectKey;
    constructor(projectKey: string);
    parseIssuesKeysFromLog(log: string[]): string[];
    parseLineForIssues(line: string): string[] | null;
}
export default JiraIssueParser;
