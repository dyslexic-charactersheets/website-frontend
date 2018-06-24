const fs = require('fs');
const _ = require('lodash');

// extract all the __ messages from all the hbs files
var messages = {};

function parseFile(filePath) {
    fs.readFile(filePath, 'utf-8', (err, data) => {
        var calls = data.match(/{{__ ".*?"}}/g);
        calls.forEach(call => {
            var msgid = call.match(/"(.*)"/)[1];
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
    });
}

function walkDir(dirPath) {
    fs.readdir(dirPath, (err, files) => {
        files.forEach(file => {
            var filePath = dirPath+"/"+file;
            fs.stat(filePath, (err, stat) => {
                if (stat.isDirectory()) {
                    walkDir(filePath);
                } else if (file.match(/.hbs$/)) {
                    parseFile(filePath);
                }
            });
        });
    });
}

walkDir("app/views");

setTimeout(function() {

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

    sortedMessages.forEach(message => {
        out += "#: "+message.sources.join(" ")+"\n";
        out += "msgid \""+message.msgid+"\"\n";
        out += "msgstr \"\"\n\n";
    });

    fs.writeFile("data/i18n/msg.pot", out);

    console.log("Done");
}, 1000);
