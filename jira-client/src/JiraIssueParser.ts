class JiraIssueParser {
    constructor(private projectKey: string) {
        console.log(
            `Initializing JiraIssueParser with project key >${projectKey}<`
        );
    }

    parseIssuesKeysFromLog(log: string[]): string[] {
        let result: string[] = [];
        log.forEach((line) => {
            let matches = this.parseLineForIssues(line);
            if (matches) {
                result = result.concat(matches);
            }
        });
        return [...new Set(result)];
    }

    parseLineForIssues(line: string): string[] | null {
        const regex = new RegExp(`(\\b${this.projectKey}-\\d*\\b)`, "gm");
        // const r = `/(\bTMPD-\d*\b)/gm`;
        return line.match(regex);
    }
}

export default JiraIssueParser;
