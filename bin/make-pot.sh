#!/bin/bash

grep '\{\{__ (.*)\}\}' -Ero views | sed 's/^\(.*\):/\n#: \1\n/' | sed 's/{{__ "\?\(.*\)"\?}}/msgid "\1"\nmsgstr ""/'


#| sed 's/"\'(.*)\'"/"\1"/'




# sed 's/:{{__ ?/\nmsgid /' 
# | sed 's/[\'"]?}}$/"/'