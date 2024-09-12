#!/usr/bin/env sh

python manage.py migrate
daphne -p3000 -b0.0.0.0 "main.asgi:application"
