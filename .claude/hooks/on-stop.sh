#!/bin/bash
# Stop hook: summarize the conversation turn and append to FEATURE_SPECS.md
# Reads JSON from stdin with session info, outputs summary for Claude to see.

set -e

SPEC_FILE="$(pwd)/FEATURE_SPECS.md"
MARKER="<!-- STOP_HOOK_MARKER"

# Read input from stdin
INPUT=$(cat)

# Check if this is already a stop-hook re-entry to avoid infinite loops
STOP_ACTIVE=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('stop_hook_active', False))" 2>/dev/null || echo "False")
if [ "$STOP_ACTIVE" = "True" ] || [ "$STOP_ACTIVE" = "true" ]; then
  exit 0
fi

# Only proceed if FEATURE_SPECS.md exists
if [ ! -f "$SPEC_FILE" ]; then
  exit 0
fi

# Append timestamp entry — Claude will fill in the summary on the next turn
TIMESTAMP=$(date '+%Y-%m-%d %H:%M')

# Output feedback to Claude (shown in context)
echo "Stop hook: FEATURE_SPECS.md is at $SPEC_FILE. If you made changes or discussed new features this turn, please append a brief summary below the STOP_HOOK_MARKER in FEATURE_SPECS.md."

exit 0
