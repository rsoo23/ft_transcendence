# 42KL-23-Ft_Transcendence

Final project at 42KL Core's Programme.

This project is about creating a website for the mighty Pong contest!

![login](https://github.com/user-attachments/assets/88dfcfcd-0844-4a23-878c-e1e247b02007)

_____

## Features
* User Management
* Game

_______
## Tech Stack
Backend: Python, Django

________
## Dependencies
Docker, docker-compose, Makefile

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

```sh
# First, make sure your current directory is in "./backend"
$ cd backend

# Then install the backend dependencies
$ pip install -r ./requirements.txt

# After that, start up django with the devrun script
$ ./devrun.sh
```
