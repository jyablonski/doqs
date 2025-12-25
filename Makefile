PHONY: up
up:
	@npm run dev

.PHONY: setup
setup:
	@npm install

.PHONY: test
test:
	@npm run test:coverage

.PHONY: build
build:
	@npm run build
