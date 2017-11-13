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
  4. Rename userData.json.template to userData.json and insert necessary data
  ```
    {
        "config": {
        "fetch": true <-- leave this alone
    },
    "login": {
        "email": "random@example.com", <-- enter email
        "password": "password123456" <-- enter password
    },      
  ```
  5. start programm with node main.js, the bot will now connect and fetch all characters and there id from the server.
  6. A new entry called bots will now appear
  ```
          {
            "characterName": "undefined", <-- The character Name, makes it easier for humans.
            "characterId": "1232923115212440", <-- the character Id, don't change it or it won't work
            "runScript": "default.js", <-- the script inside the CODE folder whichs the bot runs for this character
            "server": "EU I" <-- selects the server the character should connect to
        },
  ```
  7. Now your bot is ready to run, normal character limitations still apply.
## Running your own code
Every character can run a different file, the default code will send characters to farm tiny crabs on the main beach. To change the code that is run, change the runScript entry of the bot you want to change and after a restart the new code will be run.
New files can also be added. The runScript entry does not have to be a filename it can also be a path leading deeper into the folder structure.

## State of development
Early...


  
  
  
