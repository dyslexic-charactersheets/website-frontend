#!/bin/bash

grep '\{\{__ (.*)\}\}' -Eron views | sed 's/^\(.*\([0-9]+:\)\?\):/\n#: \1\n/' | sed 's/{{__ "\?\(.*\)"\?}}/msgid "\1"\nmsgstr ""/' > data/i18n/msg.pot


#| sed 's/"\'(.*)\'"/"\1"/'




# sed 's/:{{__ ?/\nmsgid /' 
# | sed 's/[\'"]?}}$/"/'