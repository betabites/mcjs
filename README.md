Welcome to MCJS!

This is a package/module that allows you to use NodeJS to control your own **Minecraft Dedicated Bedrock Server**.
(This project is not endorsed by Mojang)

# Installation
You can install this package through the NPM package manager using;
```
npm install @betabites/mcjs
```
Upon installation, you'll be asked to get a download link for the latest version of the Minecraft Bedrock Dedicated Server files from [minecarft.net](https://minecraft.net).

# Usage
Using MCJS is quite simple. It is important to know that all of the Minecraft server files are stored within the node module's folder. This means that files like `server.properties` that the server uses (as well as the world files), are located in:
```
./node_modules/mcjs/bedrock_server/
```

## Starting up the server
To get started, you'll want the two following script steps. The first will import the library, and the second will start up the server.
```javascript
let mcjs = require("mcjs")
let server = new mcjs.server()
```

## mcServer.sendCommand()
Use this command to interact with the native Minecraft Server console.

Example:
```javascript
await server.sendCommand("tp @a 0 72 0")
```

Returns: `String` or `null` if no response is received from the server console.

## mcServer.shutdown()
Use this command to peacefully shutdown the server and disconnect all clients.

Example:
```javascript
await server.shutdown()
console.log("The server has been shut down!")
```

## mcServer.start()
This command runs automatically when the mcServer class is created, but can also be run manually in the case that the sever has been shut down.

Example:
```javascript
await server.start()
console.log("Server has restarted!")
```

## mcServer.getOnlinePlayers()
Gets a list of all players connected to the server.

Example:
```javascript
await server.getOnlinePlayers()
```
Returns: {online: online_count, total: maximum_count, players: playerArray}

## mcServer.installExtension
Installs a supported server extension. 

Example:
```javascript
server.installExtension(extension)
```

This works by running the inputted extension's `this.connectMc` function.
```javascript
extension.connectMc(this)
```
This will give the extension the ability to manage the server.