dev-env:
	ansible-playbook ansible/dev.yml -i ansible/dev

build:
	rm -rf dist
	rm -rf public
	npx webpack
	npm run build

run:
	npm start

lint:
	npx eslint .

test:
	npm test

terraform-vars:
	ansible-playbook ansible/terraform.yml -i ansible/prod -vv --ask-vault-pass

deploy:
	git push heroku

.PHONY: test
