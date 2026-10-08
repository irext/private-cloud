#!/usr/bin/env bash

export NODE_ENV="production"

CONSOLE_LOG_DIR="/data/irext/log"
CONSOLE_NODE_LOG="${CONSOLE_LOG_DIR}/console_node.log"
mkdir -p "${CONSOLE_LOG_DIR}"

SESSION_NAME="irext-console"

tmux kill-session -t "${SESSION_NAME}" 2>/dev/null

tmux new-session -d -s "${SESSION_NAME}" \
  "set -o pipefail; \
   while true; do \
     echo \"===== node start at \$(date '+%Y-%m-%d %H:%M:%S') =====\" | tee -a '${CONSOLE_NODE_LOG}'; \
     APP_KEY='${APP_KEY}' APP_SECRET='${APP_SECRET}' OFFLINE='${OFFLINE}' NODE_ENV='production' node irext_console.js 2>&1 | tee -a '${CONSOLE_NODE_LOG}'; \
     echo \"===== node exited (code \$?) at \$(date '+%Y-%m-%d %H:%M:%S'), auto restart in 3s =====\" | tee -a '${CONSOLE_NODE_LOG}'; \
     sleep 3; \
   done"
