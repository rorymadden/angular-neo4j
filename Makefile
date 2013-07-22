REPORTER = spec
TESTS = $(shell find server/test/unit -name "*.js")

test:
	@NODE_ENV=test mocha $(TESTS) \
		--reporter $(REPORTER)

test-brk:
	@NODE_ENV=test mocha --debug-brk $(TESTS) \
		--reporter $(REPORTER)

test-cov: lib-cov
	@LIB_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov:
	@jscoverage lib lib-cov

clean:
	rm -f coverage.html
	rm -fr lib-cov

docs: docclean gendocs

gendocs:
	dox-foundation --source lib --target docs


docclean:
	rm -f ./docs/*.{1,html,json}
	rm -f ./docs/*/*.{1,html,json}

.PHONY: test test-cov clean docs docclean gendocs