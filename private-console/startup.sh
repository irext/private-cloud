#!/usr/bin/env bash
#filepath=$(cd "$(dirname "$0")"; pwd)
#cd $filepath
#NODE_ENV=${1} nohup node irext_console.js &
tmux -c "node irext_console.js &"
