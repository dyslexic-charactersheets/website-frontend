setup:
	@cd app; npm install

build:
	@cd app; nodejs build.js

run:
	@cd app; nodejs server.js

pot:
	@nodejs bin/make-pot.js
	@# @bin/make-pot.sh
	@# @find app/views/ -iname '*.hbs' -exec xgettext --from-code=utf-8 --keyword=__ --language=JavaScript --add-comments --sort-output --force-po -o data/msg.pot {} +

mo:
	@#find views/ -iname *.hbs -exec xgettext --keyword=__ --language=JavaProperties --add-comments --sort-output -o data/msg.pot {} +
	@#for lang in fr de es it ru pl; do msginit --input=data/msg.pot --locale=$$lang --output=data/msg-$$lang.po; done
	@#for lang in fr de es it ru pl; do msgfmt --outputfile=data/msg-$$lang.mo data/msg-$$lang.po; done
