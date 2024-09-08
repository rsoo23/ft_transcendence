#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
if [ ! -f "${BASEDIR}/../.env" ]
then
	echo ".env file not found at root directory, please create one."
	exit
fi

export $(cat "${BASEDIR}/../.env" | sed -e 's/#.*$//' | xargs)
export DJANGO_DEBUG=true
echo "Starting Django server with debug mode enabled..."
$BASEDIR/manage.py runserver
