start:
	npm install || true
	make build
	NODE_PORT=8883 make docker-build
	NODE_PORT=8883 make docker-up

dev:
	DEV=true ./node_modules/.bin/babel-watch src/server.js

docker-start:
	make docker-build
	make docker-up

devstart-hard:
	make clear-build || true
	make clear-deps || true
	make clear-docker || true
	make start

build:
	make clear-build || true
	mkdir bin || true
	./node_modules/.bin/babel src -d bin/src
	./node_modules/.bin/babel cli -d bin/cli
	mkdir bin/src/data

clear-build:
	rm -rf bin || true

clear-deps:
	rm -rf ./node_modules || true

clear-docker:
	docker-compose down || true

docker-up:
	docker-compose up

docker-build:
	NODE_PORT=${NODE_PORT} docker-compose build
