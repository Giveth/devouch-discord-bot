#!/bin/bash

# Deployment script for Deovuch Discord Bot

# Display help message
show_help() {
  echo "Deovuch Discord Bot Deployment Script"
  echo ""
  echo "Usage: ./deploy.sh [OPTION]"
  echo ""
  echo "Options:"
  echo "  -b, --build     Build and start the Docker containers"
  echo "  -s, --stop      Stop the running Docker containers"
  echo "  -r, --restart   Restart the Docker containers"
  echo "  -l, --logs      View the container logs"
  echo "  -h, --help      Display this help message"
  echo ""
}

# Check if Docker and Docker Compose are installed
check_dependencies() {
  if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
  fi
  
  if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
  fi
}

# Build and start the containers
build_and_start() {
  echo "Building and starting Docker containers..."
  docker-compose build --no-cache
  docker-compose up -d
  echo "Done! The bot should now be running."
}

# Stop the containers
stop_containers() {
  echo "Stopping Docker containers..."
  docker-compose down
  echo "Containers stopped."
}

# Restart the containers
restart_containers() {
  echo "Restarting Docker containers..."
  docker-compose restart
  echo "Containers restarted."
}

# View container logs
view_logs() {
  echo "Viewing container logs (press Ctrl+C to exit)..."
  docker-compose logs -f
}

# Check dependencies
check_dependencies

# Parse command line arguments
if [[ $# -eq 0 ]]; then
  show_help
  exit 0
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    -b|--build)
      build_and_start
      shift
      ;;
    -s|--stop)
      stop_containers
      shift
      ;;
    -r|--restart)
      restart_containers
      shift
      ;;
    -l|--logs)
      view_logs
      shift
      ;;
    -h|--help)
      show_help
      shift
      ;;
    *)
      echo "Unknown option: $1"
      show_help
      exit 1
      ;;
  esac
done

exit 0
