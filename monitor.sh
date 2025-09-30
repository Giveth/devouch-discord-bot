#!/bin/bash

# Monitor script for Deovuch Discord Bot
# This script checks if the bot is running properly and can be used in a cron job

# Configuration
BOT_CONTAINER_NAME="devouch-discord-bot"
HEALTH_CHECK_URL="http://localhost:8080/health"
NOTIFICATION_EMAIL="" # Add your email here if you want email notifications

# Function to check if Docker is running
check_docker() {
  if ! docker info > /dev/null 2>&1; then
    echo "[ERROR] Docker is not running"
    return 1
  fi
  return 0
}

# Function to check if the container is running
check_container() {
  if ! docker ps | grep -q $BOT_CONTAINER_NAME; then
    echo "[ERROR] Container $BOT_CONTAINER_NAME is not running"
    return 1
  fi
  return 0
}

# Function to check the health endpoint
check_health() {
  if ! curl -s $HEALTH_CHECK_URL > /dev/null; then
    echo "[ERROR] Health check failed. Bot may not be connected to Discord."
    return 1
  fi
  return 0
}

# Function to restart the container
restart_container() {
  echo "[INFO] Attempting to restart the container..."
  docker restart $BOT_CONTAINER_NAME
  sleep 10 # Wait for container to start
  
  # Check if restart was successful
  if docker ps | grep -q $BOT_CONTAINER_NAME; then
    echo "[INFO] Container restarted successfully"
    return 0
  else
    echo "[ERROR] Failed to restart container"
    return 1
  fi
}

# Function to send notification
send_notification() {
  local message="$1"
  echo "$message"
  
  # Send email notification if configured
  if [ -n "$NOTIFICATION_EMAIL" ]; then
    echo "$message" | mail -s "Deovuch Discord Bot Alert" $NOTIFICATION_EMAIL
  fi
}

# Main monitoring logic
main() {
  echo "[INFO] Starting monitoring check at $(date)"
  
  # Check if Docker is running
  if ! check_docker; then
    send_notification "Docker is not running on host. Cannot check bot status."
    exit 1
  fi
  
  # Check if container is running
  if ! check_container; then
    send_notification "Bot container is not running. Attempting to restart..."
    if restart_container; then
      send_notification "Bot container restarted successfully."
    else
      send_notification "Failed to restart bot container. Manual intervention required."
      exit 1
    fi
  fi
  
  # Check health endpoint
  if ! check_health; then
    send_notification "Bot health check failed. Bot may not be connected to Discord. Attempting to restart..."
    if restart_container; then
      # Check health again after restart
      if check_health; then
        send_notification "Bot restarted and health check passed."
      else
        send_notification "Bot restarted but health check still failing. Manual intervention required."
        exit 1
      fi
    else
      send_notification "Failed to restart bot. Manual intervention required."
      exit 1
    fi
  fi
  
  echo "[INFO] Monitoring check completed successfully at $(date)"
  exit 0
}

# Run the main function
main
