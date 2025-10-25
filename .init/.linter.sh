#!/bin/bash
cd /home/kavia/workspace/code-generation/smart-parking-reservation-system-179315-179324/firebase_backend_functions
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

