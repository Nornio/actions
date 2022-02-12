"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const JiraClient_1 = require("./JiraClient");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const email = process.env.JIRAEMAIL;
        const apiToken = process.env.JIRATOKEN;
        if (!email) {
            core.setFailed("Missing JIRAEMAIL env variable. Use env: JIRAEMAIL: ${{ secrets.MY_JIRA_MAIL_SECRET }}");
            return;
        }
        if (!apiToken) {
            core.setFailed("Missing JIRATOKEN env variable. Use env: JIRATOKEN: ${{ secrets.MY_JIRATOKEN_SECRET }}");
            return;
        }
        const missingJiraBypassTitlePrefix = core.getInput("missingJiraBypassTitlePrefix", { required: false });
        const host = core.getInput("host", { required: true });
        const projectkey = core.getInput("project-key", { required: true });
        let client = new JiraClient_1.JiraClient({
            host: host,
            email: email,
            apiToken: apiToken,
            projectKey: projectkey,
        });
        const payload = JSON.stringify(github.context.payload, undefined, 2);
        const test = ((_c = (_b = (_a = github === null || github === void 0 ? void 0 : github.context) === null || _a === void 0 ? void 0 : _a.payload) === null || _b === void 0 ? void 0 : _b.pull_request) === null || _c === void 0 ? void 0 : _c.title) || "";
        console.log(`Checking ${test}`);
        if (missingJiraBypassTitlePrefix &&
            test.startsWith(missingJiraBypassTitlePrefix)) {
            console.log(`PR title starts with ${missingJiraBypassTitlePrefix} bypassing existing JIRA issue test`);
            return;
        }
        const result = yield client.checkTextForJiras(test);
        if (result.length == 0) {
            if (missingJiraBypassTitlePrefix) {
                core.setFailed(`Pull-request title does not mention an existing JIRA issue in the project ${projectkey}. Please correct this by prefixing the title with a JIRA issue key i.e. ${projectkey}-1234. If there are no JIRA for this PR you are allowed to bypass this test by prefixing the title with ${missingJiraBypassTitlePrefix}`);
            }
            else {
                core.setFailed(`Pull-request title does not mention an existing JIRA issue in the project ${projectkey}. Please correct this by prefixing the title with a JIRA issue key i.e. ${projectkey}-1234. You can set the missingJiraBypassTitlePrefix input on this action to a string that allows bypassing of this test if set to a prefix to the title of the pull-request`);
            }
        }
        else {
            console.log("Found");
            console.log(result);
        }
    }
    catch (error) {
        console.log(error);
    }
});
main();
