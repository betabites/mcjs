const events = require("events")
const path = require("path")
const {spawn} = require("child_process")

class server extends events.EventEmitter {
    constructor() {
        super();

        this.avoid_discord = false
        this.server = null
        this.server_path = __dirname + "/bedrock_server"
        this.start()
    }

    async sendCommand(command) {
        console.log(command)
        return new Promise(resolve => {
            this.sendOutAsync = (res) => {
                clearTimeout(this.sendOutAsyncTimeout)
                resolve(res)
            }
            this.server.stdin.write(command + "\n")
            this.sendOutAsyncTimeout = setTimeout(() => {
                delete this.sendOutAsyncTimeout
                resolve("Command did not send result fast enough")
            }, 10000)
        })
    }

    async shutdown() {
        return new Promise(async resolve => {
            this.expecting_shutdown = true
            if (this.server !== null) {
                this.shutdown_resolve = resolve
                this.on("onShutdown", this.await_shutdown)
                this.server.stdin.write("stop\n")
            } else {
                resolve()
            }
        })
    }

    await_shutdown() {
        this.expecting_shutdown = false
        this.removeListener("onShutdown", this.await_shutdown)
        this.shutdown_resolve()
        delete this.shutdown_resolve
    }

    start() {
        if (this.server === null) {
            try {
                this.server = spawn(this.server_path + "/bedrock_server", [], {
                    cwd: this.server_path, env: {
                        "LD_LIBRARY_PATH": "."
                    }
                })
                this.server.stdout.on("data", data => {
                    let data_str = data.toString().slice(0, -1).replaceAll(/^\[[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9] [0-9][0-9]:[0-9][0-9]:[0-9][0-9]:[0-9][0-9][0-9] /ig, "[")
                    if (data_str !== "") {
                        try {
                            clearTimeout(this.result_coupler_timeout)
                        } catch (e) {
                        }

                        this.result_coupler.push(data_str)
                        this.emit("consoleLog", data_str)

                        if (typeof this.sendOutAsync !== "undefined") {
                            this.sendOutAsync(data_str)
                            delete this.sendOutAsync
                        }

                        if (data_str.startsWith("[INFO] Player disconnected: ")) {
                            console.log("Player disconnect triggered")
                            let data = data_str.replace("[INFO] Player disconnected: ", "").split(", xuid: ")
                            this.emit("playerDisconnect", {
                                playerName: data[0],
                                xuid: data[1]
                            })
                        }
                        if (data_str.startsWith("[INFO] Player connected: ")) {
                            let split = data_str.replace("[INFO] Player connected: ", "").split(", xuid: ")
                            this.emit("playerConnect", {
                                playerName: split[0],
                                xuid: split[1]
                            })
                        }
                    }
                })
                this.server.stdout.on("close", data => {
                    if (this.expecting_shutdown !== true) {
                        console.log("Unexpected server crash. Try running /reinstall_server.")
                        try {
                            console_channel.send("Unexpected server crash. Try running /reinstall_server.")
                        }
                        catch (e) {
                            console.log("Unexpected server crash. Try running /reinstall_server. (could not send through Discord)")
                        }
                    }
                    console.log("Server shutdown")

                    // Set all players as disconnected
                    for (let key of keys.map) {
                        if (key[1].active === true) {
                            key[1].active = false
                            key[1].active_time += Math.round(((new Date()).getTime() - key[1].active_start) / 1000)
                            key[1].active_start = (new Date()).getTime()
                        }
                    }

                    this.emit("onShutdown")
                    this.server = null
                })
                client.user.setPresence({activities: [{name: "0 players online", type: "WATCHING"}]});

                return "Server has been started"
            } catch (e) {
                console.log("Server start failed")
            }
        } else {
            return "Cannot start server. Server is already started."
        }
    }

    async getOnlinePlayers() {
        let command = (await this.sendCommand("list")).toString().split("\n")
        return {
            online: parseInt(command[0].split("/")[0].replace(/[^0-9.]/g, "")),
            total: parseInt(command[0].split("/")[1].replace(/[^0-9.]/g, "")),
            players: command[1].split(", ")
        }
    }

    installExtentions(extension) {
        extension.connectMc(this)
    }
}

module.exports = {
    server
}