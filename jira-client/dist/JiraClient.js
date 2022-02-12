"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JiraClient = void 0;
const axios_1 = require("axios");
const JiraIssueParser_1 = __importDefault(require("./JiraIssueParser"));
class NotFoundError extends Error {
    constructor() {
        super("Not found");
    }
}
class JiraClient {
    constructor(config) {
        this.cachedProject = null;
        this.host = config.host;
        this.email = config.email;
        this.project = config.projectKey;
        this.logParser = new JiraIssueParser_1.default(config.projectKey);
        const auth = Buffer.from(`${this.email}:${config.apiToken}`).toString("base64");
        this.http = new axios_1.Axios({
            transformResponse: [
                function transformResponse(data, headers) {
                    if (data) {
                        try {
                            let object = JSON.parse(data);
                            return object;
                        }
                        catch (error) {
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
    get baseUrl() {
        const apiVersion = "3";
        return `https://${this.host}/rest/api/${apiVersion}`;
    }
    makeUrl(endpoint) {
        return `${this.baseUrl}${endpoint}`;
    }
    createOrUpdateJiraRelease(version) {
        return __awaiter(this, void 0, void 0, function* () {
            let issueKeys = this.logParser.parseIssuesKeysFromLog(version.changelog);
            console.log(`Will add fix version ${version.name} to these issues ${issueKeys}`);
            try {
                yield this.addFixVersionToIssues(version, issueKeys);
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    checkTextForJiras(text) {
        return __awaiter(this, void 0, void 0, function* () {
            const lines = text.split(/\,/);
            const keys = this.logParser.parseIssuesKeysFromLog(lines);
            let result = [];
            for (const ix in keys) {
                const key = keys[ix];
                try {
                    const issue = yield this.getIssue(key);
                    result.push(issue.fields.summary);
                }
                catch (error) { }
            }
            return result;
        });
    }
    getIssue(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const endpoint = `/issue/${key}`;
            const response = yield this.http.get(this.makeUrl(endpoint));
            return response.data;
        });
    }
    validateResponse(response) {
        if (response.status < 200 || response.status > 299) {
            switch (response.status) {
                case 404:
                    throw new NotFoundError();
                default:
                    throw new Error("Invalid status code");
            }
        }
    }
    getVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            const endpoint = `/project/${this.project}/versions`;
            const response = yield this.http.get(this.makeUrl(endpoint));
            this.validateResponse(response);
            return response.data;
        });
    }
    getUnreleasedVersions() {
        return __awaiter(this, void 0, void 0, function* () {
            const versions = yield this.getVersions();
            return versions.filter((v) => v.released == false);
        });
    }
    getUnreleasedVersion(versionName) {
        return __awaiter(this, void 0, void 0, function* () {
            const versions = yield this.getUnreleasedVersions();
            var candidate = versions.filter((version) => version.name == versionName);
            if (candidate.length == 0) {
                return null;
            }
            return candidate[0];
        });
    }
    getProject() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.cachedProject) {
                return this.cachedProject;
            }
            const endpoint = `/project/${this.project}`;
            const response = yield this.http.get(this.makeUrl(endpoint));
            this.validateResponse(response);
            this.cachedProject = response.data;
            return this.cachedProject;
        });
    }
    createFixVersion(version) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Will try to create version " + version.name);
            const project = yield this.getProject();
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
            const result = yield this.http.post(url, JSON.stringify(body));
            this.validateResponse(result);
            return result.data;
        });
    }
    addFixVersionToIssues(version, issues) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const issue in issues) {
                const issueID = issues[issue];
                yield this.addFixVersion(version, issueID);
            }
        });
    }
    addFixVersion(version, issueID) {
        return __awaiter(this, void 0, void 0, function* () {
            const endpoint = `/issue/${issueID}`;
            let url = this.makeUrl(endpoint);
            let candidate = yield this.getUnreleasedVersion(version.name);
            if (!candidate) {
                console.log("No such version, create it ...");
                candidate = yield this.createFixVersion(version);
                if (!candidate) {
                    return false;
                }
            }
            const validVersionID = candidate.id;
            const body = {
                update: { fixVersions: [{ add: { id: validVersionID } }] },
            };
            try {
                const response = yield this.http.put(url, JSON.stringify(body));
                this.validateResponse(response);
                return true;
            }
            catch (error) {
                if (error instanceof NotFoundError) {
                    console.log(`WARNING: Non existing referenced JIRA ${issueID}`);
                }
                else {
                    console.log(error);
                }
                return false;
            }
        });
    }
}
exports.JiraClient = JiraClient;
