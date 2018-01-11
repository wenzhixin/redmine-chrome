#! /bin/bash

rm -rf dist dist.zip
mkdir dist
cp -r assets css js locale *.html *.png manifest.json dist
zip -r dist.zip dist
