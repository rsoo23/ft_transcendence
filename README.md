# ft_transcendence

This is the final project for 42KL's Core Program. This project provided us an introduction to web development by reimagining the classic game Pong with our own twist!

<img src="https://github.com/user-attachments/assets/4ba9bc28-9468-4f10-a5a0-7d8c9c90a6aa" alt="start_page_demo" width="500" />
<img src="https://github.com/user-attachments/assets/1c6561b1-68f0-404a-b0bb-64f0ff56ebcf" alt="start_page_demo" width="500" />

![login](https://github.com/user-attachments/assets/88dfcfcd-0844-4a23-878c-e1e247b02007)

## Requirements / Features
- Use a Framework as a backend (Django)
- Use a Database for the backend (Postgresql)
- Standard user management, authentication and users across tournaments
  - login, signup, changing user settings
- Remote Playing
  - players can play each other across different devices
- Game Customization Options
  - players can tweak the game settings before playing a match
- Live Chat
  - users can send live messages to each other
- User and Game Statistics Dashboards
- Implement Two-Factor Authentication (2FA) and JWT
- Expanding Browser Compatibility
- Replacing Basic Pong with Server-Side Pong and Implementing an API

## Snapshots
### Gameplay

<img src="https://github.com/user-attachments/assets/b85e2f77-f259-44b2-8f73-ccf89a4b9a50" alt="start_page_demo" width="500" />
<img src="https://github.com/user-attachments/assets/0cec3caf-07e3-4a23-9f0b-7fa382c0a5fc" alt="start_page_demo" width="500" />


### Match History + Game Statistics Dashboard
![image](https://github.com/user-attachments/assets/c18d4a01-a23e-43f0-9f9c-2a93235ab364)

### Friends + Live Chat Page 
![image](https://github.com/user-attachments/assets/68818ddf-a994-4c3a-96a1-cbb336c4d070)

### How to Play Page
![image](https://github.com/user-attachments/assets/70cbdd01-45cd-4cf3-b912-418281fe22a7)

### User Settings Page
![image](https://github.com/user-attachments/assets/11313b8b-fec8-4061-8460-afd92398ae23)

______
## Docker Setup
Before you do anything, copy `.env.template` and make a `.env` file. (make sure this is in the same directory as the `docker-compose.yml` file)
Make sure to also fill in the empty values.

After that, you can just run the following to get stuff up and running:
```sh
make
```
This will build the Django image and set up all the containers.

To check the status of the containers, run:
```sh
docker compose ps
```

To stop the containers, do:
```sh
make down
```

Additionally, if you want to clean up the images, do:
```sh
make fclean
```

If you want to clean up the images and rebuild at the same time, run:
```sh
make re
```

### Summary of Makefile rules
```yaml
all: (default) Stops, builds, and runs the containers.
reload: Restarts the containers.
re: Similar to "all" but removes containers, images, and volumes.
up: Runs the containers in the background.
down: Stops and removes containers running in the background (including networks)
cclean: Purges EVERYTHING Docker related, including cache and stuff. Use with caution.
fclean: Attempts to remove everything created by the containers (including volumes and images)
```

______
## Running Django without Docker
> This is only useful if you don't want to bother with using Docker to run Django.

A quick preface:
I recommend using a Python environment before doing the following steps.
If you don't know what that is, look up `venv`.

NOTE: use `devrun.sh` instead of `manage.py`, this script will automatically load the .env in the root directory, which `main/settings.py` needs to work

```sh
# First, make sure your current directory is in "./backend"
$ cd backend

# Then install the backend dependencies
$ pip install -r ./requirements.txt

# After that, start up django with the devrun script
$ ./devrun.sh runserver
```
