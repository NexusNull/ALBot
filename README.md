# Adventureland Node Bot

## Installation
### Windows
  1. Download and install node js 7.9.0 or higher from [here](https://nodejs.org/en/download/)
  2. Download repo code
  3. Open console inside the repo folder and install dependencies with "npm install"

### Linux
  1. Download and install node js 7.9.0 or higher from [here](https://nodejs.org/en/download/package-manager/)
  2. Download repo code with `git clone https://github.com/Fansana/ALBot.git`
  3. Enter the repo folder and install dependencies `cd ALBot | npm install `
  
### Further steps
  4. Change the login data in userData.json to your own.
  ```json
  {
    "config": {
        "fetch": true,
        "botKey":1
    },
    "login": {
        "email": "random@example.com",
        "password": "password123456"
    },
  }    
  ```
If fetch is set to true it will fetch the character data on the next run. This means previous entries in bots will be lost. BotKey is just a developer token to access additional permissions which is set to 1 by default.
  
  5. Start the programm with `node main.js`. Running the bot with fetch set to true will fill the bots section in `userData.json` with all available characters.
  ```json
  {
    "characterName": "undefined", 
    "characterId": "1232923115212440",
    "runScript": "default.js",
    "server": "EU I"
  },
  ```
The character name is irrelevant for running the bot and just for easier use, the bot will use the id identify the character and only fallback to the name if the id is missing. The `runScript` entry has to contain a relative path to the script that should be run for the character. `server` is the server name the character should start on, possible servers are "ASIA I", "EU I", "EU PVP", "US I", "US PVP".

  6. Now your bot is ready to run, normal character limitations still apply.
  
## Running your own code
The default code located at `./CODE/default.js`, the runScript entry in `userData.json` corresponds with the name of the script that should be run for the character. The enviroment is basically the same as in the browser with some exceptions, for example references to window, document, and PIXI have been removed and are no longer available. Because we are now in the node js enviroment we can make use of handy things like require and get access to the files system or networking. Every character can run a different file, the default code will send characters to farm tiny crabs on the main beach. To change the script that is run, change the runScript entry in userData or edit the script, after a restart the new code will be run.


## State of development
Early...


  
  
  
