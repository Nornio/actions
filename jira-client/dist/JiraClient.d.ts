interface VersionInput {
    name: string;
    description: string;
    changelog: string[];
}
interface IssueFields {
    summary: string;
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
declare class JiraClient {
    private http;
    private cachedProject?;
    private host;
    private email;
    private project;
    private logParser;
    constructor(config: JiraClientConfig);
    get baseUrl(): string;
    makeUrl(endpoint: string): string;
    createOrUpdateJiraRelease(version: VersionInput): Promise<void>;
    checkTextForJiras(text: string): Promise<string[]>;
    getIssue(key: string): Promise<Issue>;
    private validateResponse;
    getVersions(): Promise<JiraVersion[]>;
    getUnreleasedVersions(): Promise<JiraVersion[]>;
    getUnreleasedVersion(versionName: string): Promise<JiraVersion | null>;
    getProject(): Promise<JiraProject | null>;
    private createFixVersion;
    addFixVersionToIssues(version: VersionInput, issues: string[]): Promise<void>;
    private addFixVersion;
}
export { JiraClient, VersionInput, JiraClientConfig };
