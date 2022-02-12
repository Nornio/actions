"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class JiraIssueParser {
    constructor(projectKey) {
        this.projectKey = projectKey;
        console.log(`Initializing logparser with project key >${projectKey}<`);
    }
    parseIssuesKeysFromLog(log) {
        let result = [];
        log.forEach((line) => {
            let matches = this.parseLineForIssues(line);
            if (matches) {
                result = result.concat(matches);
            }
        });
        return result;
    }
    parseLineForIssues(line) {
        const regex = new RegExp(`(\\b${this.projectKey}-\\d*\\b)`, "gm");
        return line.match(regex);
    }
}
exports.default = JiraIssueParser;
