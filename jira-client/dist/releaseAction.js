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
const JiraClient_1 = require("./JiraClient");
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Inputs
        const email = process.env.JIRAEMAIL;
        const apiToken = process.env.JIRATOKEN;
        const host = core.getInput("host");
        const projectkey = core.getInput("project-key");
        const releaseName = core.getInput("release-name");
        const releaseDesciption = core.getInput("release-description");
        const releaseChangelog = core.getMultilineInput("release-changelog");
        const versionInput = {
            changelog: releaseChangelog,
            name: releaseName,
            description: releaseDesciption,
        };
        if (!email) {
            console.log("Missing JIRAEMAIL env");
            return;
        }
        if (!apiToken) {
            console.log("Missing JIRATOKEN env");
            return;
        }
        let client = new JiraClient_1.JiraClient({
            host: host,
            email: email,
            apiToken: apiToken,
            projectKey: projectkey,
        });
        yield client.createOrUpdateJiraRelease(versionInput);
        const time = new Date().toTimeString();
        core.setOutput("time", time);
        // Get the JSON webhook payload for the event that triggered the workflow
        // const payload = JSON.stringify(github.context.payload, undefined, 2);
    }
    catch (error) {
        // core.setFailed(error as Error);
        console.log(error);
    }
});
main();
