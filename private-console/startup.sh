#!/usr/bin/env bash

export NODE_ENV="production"
tmux new-session -d "APP_KEY='$APP_KEY' APP_SECRET='$APP_SECRET' OFFLINE='$OFFLINE' NODE_ENV='production' node irext_console.js"
