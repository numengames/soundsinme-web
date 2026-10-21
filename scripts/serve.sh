#!/bin/sh
cd "$(dirname "$0")/../dist" && exec python3 -m http.server 4321 --bind 127.0.0.1
