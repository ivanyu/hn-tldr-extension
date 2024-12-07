.PHONY: clean
clean:
	rm -rf dist-firefox dist-chrome web-ext-artifacts-firefox web-ext-artifacts-chrome

.PHONY: dev-prepare
dev-prepare:
	npm install

.PHONY: dev-build
dev-build:
	npm run dev

.PHONY: dev-run
dev-run:
	npx web-ext run --source-dir dist-firefox


dist-firefox:
	npm run build

.PHONY: build-firefox
build-firefox: dist-firefox
	npx web-ext build --source-dir dist-firefox --artifacts-dir web-ext-artifacts-firefox --overwrite-dest


dist-chrome: dist-firefox
	cp -r dist-firefox dist-chrome
	jq '.background = {"service_worker": .background.scripts[1]}' < dist-chrome/manifest.json > dist-chrome/manifest-tmp.json
	mv dist-chrome/manifest-tmp.json dist-chrome/manifest.json

.PHONY: build-chrome
build-chrome: dist-chrome
	npx web-ext build --source-dir dist-chrome --artifacts-dir web-ext-artifacts-chrome --overwrite-dest


.PHONY: build
build: build-firefox build-chrome
