# CheesePics
Welcome to [cheesepics](https://cheesepics.sys-256.me). It's a website I created for fun about a year ago. It used to be hosted on cheesepics.xyz, but the domain expired. In the months before, it had very few visitors, and the codebase has quite some issues, which is why is "abandoned" the project.

## Current issues
- Outdated packages (As of 29/06/2023, @types/node, better-sqlite3 and typescript have a major update pending)
- cheesepics.xyz/cheesepics.sys-256.me naming (Some meta tags are still on cheesepics(.xyz), and the websocket links to cheesepics.sys-256.me. These should be added into config.ts and dynamically added)
- Liking things (/liked hasn't been implemented, and you get an error when trying to like an image)
- Broken CSS (The navbar, for example, doesnt have it's element vertically centered. The like button is under the image, where "in" the image would look better)
- Avatars are unimplemented
- Errors aren't handled nicely (just gives an alert with ERR;;CLIENT;;thing right now)

## How to setup
- NGINX
	- Copy the contents of [the nginx file](./nginx.conf) to your own nginx.conf file for the reverse proxy
- MariaDB
	- Start with `docker run --detach --name mariadb --env MARIADB_ROOT_PASSWORD=passwd -p 3306:3306  mariadb:latest`. Change the MARIADB_ROOT_PASSWORD variable to something only you know before running the command.
	- Change the password in config.ts
	- Run [the init file](./init.sql), and add your images (eg: `INSERT INTO images VALUES("filename.jpg", "CC", "me");`)
	- Also add the images (like filename.jpg) to `./public/images/cheese`
- Sessions DB
	- Create the file `./sessions.sqlite3` as an sqlite3 database, and run [the init file](./sessions_init.sql) on it.
- Change the contact information in [the config file](./config.ts).
- Start the server
	- Install the dependencies with `npm i` and run `npm run build`.
	- Run `npm start` to start both the frontend and backend
- Port forward
	- Open port 80 on your router
	- Also make sure you have SSL and a domain available, else it wont work with wss
- Done!

## FAQ
- Will this repository ever be un-archived?
	- Probably not, unless I gain back interest and someone else has fixed some things described in Current Issues.
- How can I ask you for help?
	- If you need clarification while setting up CheesePics or while making changes to the codebase, you can use any of the platforms specified in the "Contact" section on https://sys-256.me.
	- I cannot guarantee I will provide you with assistance. It's been a while since I actively worked CheesePics, so I don't remember everything of how the codebase works. 

## License
See [the license file](./LICENSE). You are free to fork this project and make changes, as long as the terms set by the license are being followed.