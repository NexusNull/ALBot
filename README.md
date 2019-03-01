# ALBot

## Installation Debian 8
1. Update system
    ```
    sudo apt update
    sudo apt upgrade
    ```
2. Install packages
    ```
    sudo apt install git nano screen curl
    ```
3. Install nvm
    ```
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
    ```
4. Use nvm to install node 7.9.0
    ```
    nvm install 7.9.0
    ```
5. Download ALBot
    ```
    git clone https://github.com/NexusNull/ALBot.git
    ```
6. Install package dependencies
    ```
    cd ALBot
    npm install 
    ```
7. Rename copy config file and enter credentials. If you don't know how refer to Section [Understanding userdata.json](https://github.com/NexusNull/ALBot/#Understanding%20userdata.json) 
    ```
    cp userdata.json-example userdata.json nanouserdata.json
    nano userdata.json
    ```
8. Run the bot once with
    ```
    node main
    ```
    The bot will then try to login to your account and save your character ids to userdata.json
9. Open userdata.json again and delete all the character objects you don't want to run.
Currently there is no client side check for character limitations, if you forget this your bot will keep disconnecting.

10. Congratulations you now have a working copy of ALBot, if you experience unexpected behavior please raise an issue.
    ### Understanding userdata.json
Rename `userData.json-example` to `userData.json`, and change the data to your own.
    ```code
        "config": {
            //Set to true to fetch available userdata on next run(Will overwrite existing userdata)
            "fetch": true,
            "botKey": 1,
            //Used to display basic information about every bot run with ALBot
            "botWebInterface": {
                "start": false,
                //The port that BWI runs on
                //BWI requires 2 Ports one for HTTP and on WebSocket these are always in series.
                //The WebSocket is always 1 higher than the HTTP port so 81 and 82 in this case.
                "port": 81
            }
        },
         "login": {
             "email": "random@example.com",
             "password": "password123456"
         }
  }
  ```
If you have questions and/or suggestions please refer to [repo](https://github.com/NexusNull/bot-web-interface).
If fetch is set to true it will fetch your character data on the next run. This means previous entries in bots will be overwritten. BotKey is a developer token that allows access to additional permissions - enabled by default.

5. Start the program with `node main.js`.
    By default the bot will connect to the server, fetch the data for all available characters, and then close again.
    After the fetch is complete, you can edit the CODE script that is run for each character and the server it should connect to.
    ```json
  {
    "characterName": "undefined", 
    "characterId": "1232923115212440",
    "runScript": "default.js",
    "server": "EU I"
  }
  ```
The character name is irrelevant when running ALBot. The bot will use the character id to identify the character and only refer to its name if the id is missing.
    The `runScript` entry must contain a relative path to the script that should be run for the character. `server` is the server name the character should connect to, the possible servers are "US I", "US PVP".
    There used to be more but sadly they were taken down.

6. Now your bot is ready to run, normal character limitations still apply.

    ## Running your own code
The default code located at `./CODE/default.js`, the runScript entry in `userData.json` corresponds with the name of the script that should be run for the character. The environment is fundamentally the same as a browser with some exceptions, for example references to window, document, and PIXI are not supported.  Every character can run a different file, the default.js script will send characters to farm tiny crabs on the main beach.
