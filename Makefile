CHROME_ARTIFACT_DIR=web-ext-artifacts-chrome
FIREFOX_ARTIFACT_DIR=web-ext-artifacts-firefox

.PHONY: clean
clean:
	rm -rf dist-firefox dist-chrome $(CHROME_ARTIFACT_DIR) $(FIREFOX_ARTIFACT_DIR)

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
	npx web-ext build --source-dir dist-firefox --artifacts-dir $(FIREFOX_ARTIFACT_DIR) --overwrite-dest
	cd $(FIREFOX_ARTIFACT_DIR) && for f in *.zip; do mv "$$f" "$$(echo $$f | sed 's/\.zip/-firefox.zip/')" ; done


dist-chrome: dist-firefox
	cp -r dist-firefox dist-chrome
	jq '.background = {"service_worker": .background.scripts[-1]}' < dist-chrome/manifest.json > dist-chrome/manifest-tmp.json
	mv dist-chrome/manifest-tmp.json dist-chrome/manifest.json

.PHONY: build-chrome
build-chrome: dist-chrome
	npx web-ext build --source-dir dist-chrome --artifacts-dir $(CHROME_ARTIFACT_DIR) --overwrite-dest
	cd $(CHROME_ARTIFACT_DIR) && for f in *.zip; do mv "$$f" "$$(echo $$f | sed 's/\.zip/-chrome.zip/')" ; done

.PHONY: build
build: build-firefox build-chrome
