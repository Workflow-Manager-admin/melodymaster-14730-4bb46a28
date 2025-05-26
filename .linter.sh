#!/bin/bash
cd /home/kavia/workspace/code-generation/melodymaster-14730-4bb46a28/melodymaster_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

