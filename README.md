# Adventureland Node Bot

## Installation
  1. Download git and node js 7.9.0 and install them
    [git](https://git-scm.com/downloads)
    [node](https://nodejs.org/en/download/package-manager/)
  2. Download repo code with `git clone https://github.com/NexusNull/ALBot.git`
  3. Enter the repo folder and install dependencies with ` npm install `
  
### getting your bot to work.
  4. Rename `userData.json-example` to `userData.json`, and change the data to your own.
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
  If you have questions and suggestions please refer to the[repo](https://github.com/NexusNull/bot-web-interface).
  If fetch is set to true it will fetch the character data on the next run. This means previous entries in bots will be lost. BotKey is just a developer token to access additional permissions which is set to 1 by default.
  
  5. Start the programm with `node main.js`.
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





  
  
  
