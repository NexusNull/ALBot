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
    curl -o-https://raw.githubusercontent.com/creationix/nvm/v0.33.11/install.sh | bash
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
   Currently there is no check client side for character limitations so if you forget this your bot will keep disconnecting.
   
10. Congratulation you now have a working copy of ALBot, if experience unexpected behavior your can submit an issue.
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
  If you have questions and suggestions please refer to this [repo](https://github.com/NexusNull/bot-web-interface).
  If fetch is set to true it will fetch the character data on the next run. This means previous entries in bots will be lost. BotKey is just a developer token to access additional permissions which is set to 1 by default.
  
  5. Start the program with `node main.js`.
  By default the bot will now connect to the server, fetch the data for all available characters, and then close again.
  After that is done you can edit the script that is run for a character and also the server it connects to.
  ```json
  {
    "characterName": "undefined", 
    "characterId": "1232923115212440",
    "runScript": "default.js",
    "server": "EU I"
  }
  ```
  The character name is irrelevant for running the bot and just for easier use, the bot will use the id to identify the character and only fallback to the name if the id is missing.
  The `runScript` entry has to contain a relative path to the script that should be run for the character. `server` is the server name the character should start on, possible servers are "US I", "US PVP".
  There used to be more but sadly they got taken down.

  6. Now your bot is ready to run, normal character limitations still apply.
  
## Running your own code
  The default code located at `./CODE/default.js`, the runScript entry in `userData.json` corresponds with the name of the script that should be run for the character. The environment is basically the same as in the browser with some exceptions, for example references to window, document, and PIXI have been removed and are no longer available.  Every character can run a different file, the default code will send characters to farm tiny crabs on the main beach.





  
  
  
