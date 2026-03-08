#!/bin/bash
# Serve the learning app on localhost:8080
# Audio files need HTTP to load properly in the browser
cd "$(dirname "$0")"
echo "Starting learning app at http://localhost:8080"
echo "Press Ctrl+C to stop"
python3 -m http.server 8080
