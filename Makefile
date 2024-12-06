.PHONY: clean
clean:
	rm -rf dist web-ext-artifacts

.PHONY: dev-prepare
dev-prepare:
	npm install

.PHONY: dev-build
dev-build:
	npm run dev

.PHONY: dev-run
dev-run:
	npx web-ext run --source-dir dist

.PHONY: build
build:
	npm run build
	npx web-ext build --source-dir dist
