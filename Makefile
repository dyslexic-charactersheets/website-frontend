setup:
	npm install

run:
	@nodejs server.js

pot:
	@bin/make-pot.sh

mo:
	@#find views/ -iname *.hbs -exec xgettext --keyword=__ --language=JavaProperties --add-comments --sort-output -o data/msg.pot {} +
	@#for lang in fr de es it ru pl; do msginit --input=data/msg.pot --locale=$$lang --output=data/msg-$$lang.po; done
	@#for lang in fr de es it ru pl; do msgfmt --outputfile=data/msg-$$lang.mo data/msg-$$lang.po; done
