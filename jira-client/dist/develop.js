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
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const JiraClient_1 = require("./JiraClient");
const conf = {
    apiToken: process.env.JIRATOKEN,
    email: process.env.JIRAEMAIL,
    host: "nornio.atlassian.net",
    projectKey: "NPD",
};
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    const c = new JiraClient_1.JiraClient(conf);
    const result = yield c.checkTextForExistingJiras("NPD-3, NPD-1");
    console.log(result);
    const f = new JiraClient_1.Formatting();
    console.log(f.getTodaysDate());
});
main();
