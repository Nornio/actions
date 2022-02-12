class JiraIssueParser {
    constructor(private projectKey: string) {
        console.log(`Initializing logparser with project key >${projectKey}<`);
    }

    parseIssuesKeysFromLog(log: string[]): string[] {
        //const lines = log.split(/\r?\n?%0A?%0D/);
        let result: string[] = [];
        log.forEach((line) => {
            let matches = this.parseLineForIssues(line);
            if (matches) {
                result = result.concat(matches);
            }
        });
        return result;
    }

    parseLineForIssues(line: string): string[] | null {
        const regex = new RegExp(`(\\b${this.projectKey}-\\d*\\b)`, "gm");
        // const r = `/(\bTMPD-\d* \b)/gm`;
        return line.match(regex);
    }
}

export default JiraIssueParser;
