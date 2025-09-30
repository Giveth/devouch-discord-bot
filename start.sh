#!/bin/sh
# Start the health check server in the background
node health-check.js &
# Start the Discord bot
node dist/index.js
