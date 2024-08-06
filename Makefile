
DC		=	docker compose -f
YAML	=	docker-compose.yml
RMRF	=	sudo rm -rf

up: build
		$(DC) $(YAML) up -d

build:
		$(DC) $(YAML) build

down:
		$(DC) $(YAML) down
all:
		$(DC) $(YAML) up -d --build

cclean:
		docker system prune --all --volumes --force

fclean:
		docker stop $$(docker ps -qa);
		docker rm $$(docker ps -qa); \
		docker rmi -f $$(docker images -qa); \
		docker volume rm $$(docker volume ls -q); \
		docker network ls -q | grep -v -E 'bridge|host|none' | xargs -r docker network rm;

re: fclean up

.PHONY:	all down fclean re build cclean up
