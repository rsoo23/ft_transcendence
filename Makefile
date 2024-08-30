
DC		=	docker compose -f
YAML	=	docker-compose.yml
RMRF	=	sudo rm -rf

all: down build up
reload: down up
re: fclean all

up:
		$(DC) $(YAML) up -d

build:
		$(DC) $(YAML) build

down:
		$(DC) $(YAML) down

cclean:
		docker system prune --all --volumes --force

fclean: down
		docker rmi -f $$(docker images -qa); \
		docker volume rm $$(docker volume ls -q); \

.PHONY:	all down fclean re build cclean up
