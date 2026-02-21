# Exploratory Website
An exploration focused project to practice & learn key skills in developing, deploying & maintaining a website

## Setup
1. Make a local clone of the repo
2. Run the terminal command `npm install`
3. Start the server with the terminal command `node server.js`
4. Fill out the secret field of now generated config.json. According to the [express-session documentation](https://expressjs.com/en/resources/middleware/session.html), this should be at least 32 Bytes of entropy

Key files such as the accounts directory, the canvas.json file & the config.json file will be automatically generated on first run. 

## Page Access Tiers

### Public (Base)
Pages that are served freely to any user, and can be accessed by making a get request to their filename on the root directory.

### Light (/light)
Pages stored inside the folder lightpublic are served to any user who has already given themselves a username through /lightlogin.html. These users have a session & a "Nickname", note nicknames are not reserved, not unique, and are no more than self identified labels. They are not, and should not be used for logic, but allow for data to be labeled for the purposes of social interaction.

### Protected (/protected)
Pages stored inside the folder protectedpublic are served only to users who have successfully logged into a proper account. These users have a session with their official username, which are unique to each account & locked behind passwords. These pages can further restrict themselves by utilizing the permissions field attached to accounts (Partly Implemented).
