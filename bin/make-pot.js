const fs = require('fs');
const _ = require('lodash');

// extract all the __ messages from all the hbs files
var messages = {};
var loadingQueue = [];

function parseFile(filePath) {
    let filePromise = new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf-8', (err, data) => {
            let calls = data.match(/{{__ ".*?"}}/g);
            if (calls) {
                calls.forEach(call => {
                    let msgid = call.match(/"(.*)"/)[1];
                    // console.log("Message: "+JSON.stringify(msgid));
                    if(_.has(messages, msgid)) {
                        messages[msgid].sources.push(filePath);
                        messages[msgid].count++;
                    } else {
                        messages[msgid] ={
                            sources: [filePath],
                            msgid: msgid,
                            count: 1,
                            msgstr: ''
                        };
                    }
                });
            }
            resolve();
        });
    });
    loadingQueue.push(filePromise);
}

function walkDir(dirPath) {
    let dirPromise = new Promise((resolve, reject) => {
        fs.readdir(dirPath, (err, files) => {
            resolve();
            files.forEach(file => {
                var filePath = dirPath+"/"+file;
                let stat = fs.statSync(filePath);
                if (stat.isDirectory()) {
                    walkDir(filePath);
                } else if (file.match(/.hbs$/)) {
                    parseFile(filePath);
                }
            });
        });
    });
    loadingQueue.push(dirPromise);
}

walkDir("app/views");

setTimeout(function() {
    Promise.all(loadingQueue).then(() => {
        try {
            // sort the messages into order
            var sortedMessages = _.values(messages);
            sortedMessages.sort(function (a, b) {
                if (a.msgid != b.msgid) {
                    return a.msgid.localeCompare(b.msgid);
                }
                if (a.msgcstr != b.msgcstr) {
                    if (a.msgcstr == "") {
                        return -1;
                    }
                    if (b.msgcstr == "") {
                        return 1;
                    }
                    return a.msgcstr.localeCompare(b.msgcstr);
                }
                return b.count - a.count;
            });

            // header
            var out = "";
            out += "# Dyslexic Character Sheets Website\n"
            out += "#. Game: Website\n"
            out += "#, fuzzy\n"
            out += "msgid \"\"\n"
            out += "msgstr \"\"\n"
            out += "\"Content-Type: text/plain; charset=UTF-8\"\n"
            out += "\"Content-Transfer-Encoding: 8bit\"\n"
            out += "\"Project-Id-Version: dyslexic-charactersheets 0.12.1\"\n"
            out += "\"POT-Creation-Date: 2020-3-22 12:13+0000\"\n"
            out += "\"PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE\"\n"
            out += "\"Last-Translator: \"\n"
            out += "\"Language-Team: \"\n"
            out += "\"Language: \"\n"
            out += "\"MIME-Version: 1.0\"\n"
            out += "\n\n"

            sortedMessages.forEach(message => {
                out += "#: "+message.sources.join(" ")+"\n";
                out += "#, javascript-format\n"
                out += "msgid \""+message.msgid+"\"\n";
                out += "msgstr \"\"\n\n";
            });

            fs.writeFile("data/i18n/msg.pot", out, (err) => {
            });

            console.log("Done");
        } catch (e) {
            console.log("Error");
            console.log(e);
        }
    });
}, 100);
