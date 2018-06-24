#!/bin/bash

# grep '\{\{__ (.*)\}\}' -Eron app/views | sed 's/^\(.*\([0-9]+:\)\?\):/\n#: \1\n/' #| sed 's/{{__ "\(.*\)"}}/msgid "\1"\nmsgstr ""/' | > data/i18n/msg.pot


#| sed 's/"\'(.*)\'"/"\1"/'




# sed 's/:{{__ ?/\nmsgid /' 
# | sed 's/[\'"]?}}$/"/'



grep '\{\{__ (.*)\}\}' -Eron app/views | while read line
do
    echo "Line: $line"
    src="$(echo "$line" | grep -o '^.*\([0-9]+:\)\?')"
    echo "Src: $src"
    
    echo ""
done