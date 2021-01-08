#!/bin/bash
npm stop
git pull
npm start &
echo Done!
