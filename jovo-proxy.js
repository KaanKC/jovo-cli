#!/usr/bin/env node
'use strict';
const program = require('commander');
const childProcess = require('child_process');
const BSTProxy = require('bespoken-tools').BSTProxy;
const fs = require("fs");
const path = require("path");

function getUserHome() {
    return process.env[(process.platform === "win32") ? "USERPROFILE" : "HOME"];
}

function runScript(scriptPath, callback) {
    let invoked = false;

    const process = childProcess.fork(scriptPath);

    process.on('error', function (err) {
        if (invoked) return;
        invoked = true;
        callback(err);
    });

    process.on('exit', function (code) {
        if (invoked) return;
        invoked = true;
        const err = code === 0 ? null : new Error('exit code ' + code);
        callback(err);
    });

    return process;

}
program
    .usage("[webhookFile]")
    .description("Proxies an HTTP service running at the specified port")
    .action( function (webhookFile) {
        let jovoWebhook;
        try {
            const proxy = BSTProxy.http(3000);

            proxy.start(() => {
                const data = fs.readFileSync(path.join(getUserHome(), ".bst/config"));
                const bstConfig = JSON.parse(data.toString());
                const proxyURL = "https://" + bstConfig.sourceID + ".bespoken.link/webhook";
                const dashboardURL = "https://bespoken.tools/dashboard?id=" + bstConfig.sourceID + "&key=" + bstConfig.secretKey;
                let messageOutput = "Your public URL for accessing your local service:\n";
                messageOutput += proxyURL + "\n\n";
                messageOutput += "Your URL for viewing requests/responses sent to your service:\n";
                messageOutput += dashboardURL + "\n\n";
                messageOutput += "Copy and paste this to your browser to view your transaction history and summary data.\n";
                console.log(messageOutput);
            });

            const localServerFile = webhookFile ? webhookFile : "index.js";
            jovoWebhook = runScript(localServerFile, (error) => {
                // This is called on errors that prevent start or in exit, so we close proxy anyway
                proxy.stop();
            });
        } catch (err) {
            if (jovoWebhook) {
                jovoWebhook.kill();
            }
        }
    });

// calling the command without parameters doesn't route to this file correctly. Adding default parameter manually
// if not provided.
if (process.argv.length === 2) {
    process.argv.splice(2, 0, "index.js");
}


program.parse(process.argv);