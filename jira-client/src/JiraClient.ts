import { Axios, AxiosResponse } from "axios";
import JiraIssueParser from "./JiraIssueParser";

class NotFoundError extends Error {
    constructor() {
        super("Not found");
    }
}

interface VersionInput {
    name: string;
    description: string;
    changelog: string[];
}

interface IssueFields {
    summary: string;
}

interface IssueReporter {
    emailAddress: string;
    displayName: string;
}

interface Issue {
    id: string;
    key: string;
    fields: IssueFields;
}

interface JiraVersion {
    self: string;
    id: string;
    description: string;
    name: string;
    archived: boolean;
    released: boolean;
    startDate: string;
    releaseDate: string;
    userStartDate: string;
    userReleaseDate: string;
    projectId: number;
}

interface JiraProject {
    self: string;
    id: string;
    key: string;
    description: string;
}

interface JiraClientConfig {
    host: string;
    email: string;
    apiToken: string;
    projectKey: string;
}

class JiraClient {
    private http: Axios;
    private cachedProject?: JiraProject | null = null;
    private host: string;
    private email: string;
    private project: string;

    private logParser: JiraIssueParser;

    constructor(config: JiraClientConfig) {
        this.host = config.host;
        this.email = config.email;
        this.project = config.projectKey;
        this.logParser = new JiraIssueParser(config.projectKey);
        const auth = Buffer.from(`${this.email}:${config.apiToken}`).toString(
            "base64"
        );

        this.http = new Axios({
            transformResponse: [
                function transformResponse(data, headers) {
                    if (data) {
                        try {
                            let object = JSON.parse(data);
                            return object;
                        } catch (error) {
                            console.log("Error parsing response data", error);
                        }
                    }
                },
            ],
            headers: {
                authorization: `Basic ${auth}`,
                accept: "application/json",
                "content-type": "application/json",
            },
        });
    }

    get baseUrl(): string {
        const apiVersion = "3";
        return `https://${this.host}/rest/api/${apiVersion}`;
    }

    makeUrl(endpoint: string): string {
        return `${this.baseUrl}${endpoint}`;
    }

    /// Create a jira release based on whats inside the release notes
    /// No release will be created if there is no Jira issue keys in the log
    public async createOrUpdateJiraRelease(version: VersionInput) {
        let issueKeys = this.logParser.parseIssuesKeysFromLog(
            version.changelog
        );
        console.log(
            `Will add fix version ${version.name} to these issues ${issueKeys}`
        );

        try {
            await this.addFixVersionToIssues(version, issueKeys);
        } catch (error) {
            console.error(error);
        }
    }

    // Check a line of text for jira issue references
    public async checkTextForJiras(text: string): Promise<string[]> {
        const lines = text.split(/\,/);

        const keys = this.logParser.parseIssuesKeysFromLog(lines);
        let result: string[] = [];

        for (const ix in keys) {
            const key = keys[ix];
            try {
                const issue = await this.getIssue(key);
                result.push(issue.fields.summary);
            } catch (error) {}
        }
        return result;
    }

    public async getIssue(key: string): Promise<Issue> {
        // /issue/{issueIdOrKey}
        const endpoint = `/issue/${key}`;
        const response = await this.http.get<Issue>(this.makeUrl(endpoint));
        return response.data;
    }

    private validateResponse(response: AxiosResponse) {
        if (response.status < 200 || response.status > 299) {
            switch (response.status) {
                case 404:
                    throw new NotFoundError();
                default:
                    throw new Error("Invalid status code");
            }
        }
    }

    ///  Versions

    async getVersions(): Promise<JiraVersion[]> {
        const endpoint = `/project/${this.project}/versions`;
        const response = await this.http.get<JiraVersion[]>(
            this.makeUrl(endpoint)
        );
        this.validateResponse(response);
        return response.data;
    }

    async getUnreleasedVersions(): Promise<JiraVersion[]> {
        const versions = await this.getVersions();
        return versions.filter((v) => v.released == false);
    }

    async getUnreleasedVersion(
        versionName: string
    ): Promise<JiraVersion | null> {
        const versions = await this.getUnreleasedVersions();
        var candidate = versions.filter(
            (version) => version.name == versionName
        );

        if (candidate.length == 0) {
            return null;
        }

        return candidate[0];
    }

    /// Get the project
    async getProject(): Promise<JiraProject | null> {
        if (this.cachedProject) {
            return this.cachedProject;
        }

        const endpoint = `/project/${this.project}`;
        const response = await this.http.get<JiraProject | null>(
            this.makeUrl(endpoint)
        );
        this.validateResponse(response);
        this.cachedProject = response.data;
        return this.cachedProject;
    }

    private async createFixVersion(
        version: VersionInput
    ): Promise<JiraVersion | null> {
        console.log("Will try to create version " + version.name);

        // First get the project
        const project = await this.getProject();

        if (!project) {
            return null;
        }

        const endpoint = `/version`;
        let url = this.makeUrl(endpoint);

        const body = {
            archived: false,
            releaseDate: "2022-02-15",
            name: version.name,
            description: version.description,
            projectId: project.id,
            released: false,
        };

        const result = await this.http.post<JiraVersion | null>(
            url,
            JSON.stringify(body)
        );
        this.validateResponse(result);
        return result.data;
    }

    /// Add a fix version to several issues
    async addFixVersionToIssues(version: VersionInput, issues: string[]) {
        for (const issue in issues) {
            const issueID = issues[issue];
            await this.addFixVersion(version, issueID);
        }
    }

    /// Add a fix version to an issue
    private async addFixVersion(
        version: VersionInput,
        issueID: string
    ): Promise<Boolean> {
        const endpoint = `/issue/${issueID}`;
        let url = this.makeUrl(endpoint);

        // Get the versions
        let candidate = await this.getUnreleasedVersion(version.name);

        if (!candidate) {
            console.log("No such version, create it ...");
            candidate = await this.createFixVersion(version);
            if (!candidate) {
                return false;
            }
        }

        // console.log("Got a version candidate");
        // console.log(candidate);

        const validVersionID = candidate.id;

        const body = {
            update: { fixVersions: [{ add: { id: validVersionID } }] },
        };

        // console.log("Will post");
        // console.log(JSON.stringify(body));
        try {
            const response = await this.http.put(url, JSON.stringify(body));
            this.validateResponse(response);
            return true;
        } catch (error) {
            if (error instanceof NotFoundError) {
                console.log(`WARNING: Non existing referenced JIRA ${issueID}`);
            } else {
                console.log(error);
            }
            return false;
        }
    }
}

export { JiraClient, VersionInput, JiraClientConfig };
