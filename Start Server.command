#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Server starting at http://localhost:5555"
echo "   Open http://localhost:5555/design-system.html for token editor"
echo ""
open http://localhost:5555
node server.js
