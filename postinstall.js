// This script runs after the install has completed, and requests the user to get the link to the latest version of the Minecraft Bedrock Dedicated server
const readline = require('readline');
const https = require("https");
const fs = require("fs")
const unzip = require("unzipper");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("👋 Thank you for installing mcjs!")
console.log("Before you can use mcjs, need to download a copy of the server software. To do this, please follow the following steps:\n" +
    "1. Open https://www.minecraft.net/en-us/download/server/bedrock in your browser\n" +
    "2. Locate the supported OS that you are using, then select the checkbox at the bottom of it's box\n" +
    "3. Right-click the download button, and select 'Copy link'")

function ask_question(question) {
    return new Promise(resolve => {
        rl.question(question, result => {
            resolve(result)
        })
    })
}

async function unzip_loop() {
    let link
    while (true) {
        link = await ask_question("Please paste the link in here, then press ENTER: ")
        if (link.startsWith("https://minecraft.azureedge.net/")) {
            break
        }
        console.log("That link doesn't seem to be correct")
    }

    // Download and unzip the file
    if (!fs.existsSync(__dirname + "/bedrock_server")){
        fs.mkdirSync(__dirname + "/bedrock_server");
    }
    https.get(link, (res) => {
        console.log("Unzipping server files... This may take a minute...")
        res.pipe(unzip.Extract({path: __dirname + "/bedrock_server"}))
    })
}

unzip_loop()