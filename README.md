# website2
New website

## How to install

This runs best on a Linux, Unix or Mac OS. It can also run on Windows using LXSS (aka "Bash for Windows").

First install Node.js and NPM

```sh
$ apt install nodejs
```

Then use NPM to install the listed packages.

```sh
$ npm install
```

## How to run

```sh
$ make run
```

## How to translate

Generate a `pot` template file

```sh
$ make pot
```

The translatable lines will be saved to `data/i18n/msg.pot`.

Feed that file through a translation system to produce specific translation files for each language, eg `data/i18n/fr.po`. The Node website will pick up files from there.