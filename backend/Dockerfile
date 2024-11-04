FROM python:3.12-alpine
WORKDIR /app/django
COPY . .
RUN chmod +x docker-entrypoint.sh
RUN pip install -r requirements.txt

ENTRYPOINT ["./docker-entrypoint.sh"]
