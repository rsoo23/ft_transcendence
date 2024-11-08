#!/usr/bin/env sh

echo "====="
echo "Collecting Django static files...."
echo "-----"
python manage.py collectstatic --no-input
echo "====="
echo "Migrating Django database changes...."
echo "-----"
python manage.py migrate
echo "====="
echo "Attempting to create superuser with .env values...."
echo "-----"
python manage.py createsuperuser --no-input
echo "====="
echo "Starting Django/Daphne...."
echo "-----"
daphne -p3000 -b0.0.0.0 "main.asgi:application"
