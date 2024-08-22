FROM python:3.12-alpine
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
RUN python manage.py migrate

CMD ["daphne", "-p3000", "-b0.0.0.0", "main.asgi:application"]
