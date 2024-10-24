#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
if [ ! -f "${BASEDIR}/../.env" ]; then
    echo ".env file not found at root directory, please create one."
    exit 1
fi

export $(cat "${BASEDIR}/../.env" | sed -e 's/#.*$//' | xargs)
export DJANGO_DEBUG=true

# Add user local bin to PATH
export PATH="$HOME/.local/bin:$PATH"

# Function to check and install Redis if not found
function find_or_install_redis {
    if ! command -v redis-server &> /dev/null; then
        echo "redis-server not found in PATH."
        if [ -x "$(command -v apt)" ]; then
            # Ubuntu/Debian based systems
            echo "Attempting to install Redis on Ubuntu/Debian..."
            sudo apt update
            sudo apt install -y redis-server
            sudo systemctl enable redis
            sudo systemctl start redis
            echo "Redis installed and started."
        else
            echo "Unsupported Linux distribution. Please install Redis manually."
            exit 1
        fi
    else
        echo "redis-server found in PATH."
    fi
}

# Call the function to check for Redis and install if needed
find_or_install_redis

echo "Starting Redis server..."
redis-server redis.conf --daemonize yes

sleep 2

# Check if Redis started successfully
if [[ $? -ne 0 ]]; then
    echo "Failed to start Redis server."
    exit 1
fi

echo "Running manage.py with debug mode forcefully enabled..."
python3 "$BASEDIR/manage.py" "$@"

# Optional: Add a cleanup command to stop Redis when the script is stopped
trap 'echo "Stopping Redis server..."; redis-cli shutdown; exit' SIGINT SIGTERM

# Keep the script running until interrupted
wait