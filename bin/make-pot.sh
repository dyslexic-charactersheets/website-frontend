#!/bin/bash

multiline() {
    echo "${1}" | while read line
    do
        echo "\"${line}\""
    done
}

write_pot() {
    echo "# Dyslexic Character Sheets Website"
    echo "#. Game: Wesbites"
    echo "#, fuzzy"
    echo "msgid \"\""
    echo "msgstr \"\""
    echo "\"Content-Type: text/plain; charset=UTF-8\n\""
    echo "\"Content-Transfer-Encoding: 8bit\n\""
    echo "\"Project-Id-Version: dyslexic-charactersheets 0.12.1\n\""
    echo "\"POT-Creation-Date: 2020-3-22 12:13+0000\n\""
    echo "\"PO-Revision-Date: YEAR-MO-DA HO:MI+ZONE\n\""
    echo "\"Last-Translator: \n\""
    echo "\"Language-Team: \n\""
    echo "\"Language: \n\""
    echo "\"MIME-Version: 1.0\n"
    echo ""

    grep '\{\{__ (.*?)\}\}' -Eron app/views | while read line
    do
        echo "## $line"
        src="$(echo "$line" | grep -o '^.*\([0-9]+:\)\?' | cut -d ':' -f1-2)"
        str="$(echo "$line" | grep -o '^.*\([0-9]+:\)\?' | cut -d ':' -f3-)"
        
        echo "${str}" | grep -oE '\{\{__ "(.*?)"\}\}' | sed 's/^{{__ "//' | sed 's/"}}$//' | while read group
        do
            echo "## ${group}"
            # group="$(echo "$group" | multiline )"
            echo "#: $src"
            echo "#, javascript-format"
            echo "msgid \"$group\""
            echo "msgstr \"\""
            echo ""
        done

    done
}

write_pot > data/i18n/website.pot