

firebase: 
	firebase emulators:start

test:
	cd testing && yarn test

info:
	cd tightship-config && node ./dev-setup.js info

setup:
	cd tightship-config && node ./dev-setup.js setup

new-setup:
	cd tightship-config && rm -rf .postgres_data && node ./dev-setup.js setup


containers:
	docker compose up -d

codecount:
	cloc . --exclude-dir=node_modules
