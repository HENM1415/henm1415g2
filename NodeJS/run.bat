:: Run database on local /data directory (separate console).
start cmd /k mongod --dbpath ./data

:: Run node app (separate console).
start cmd /k node app.js

:: Launch a chrome window pointing to node app.
start Chrome --new-window http://127.0.0.1:1337/?type=login&username=lol&password=lolol