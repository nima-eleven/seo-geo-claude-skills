#!/usr/bin/env bash
# Local QA helper: rebuild-safe restart of the production server on a fixed port.
set -u
PORT="${1:-3111}"
LOG="${2:-/tmp/next-server.log}"

# Kill only the server listening on PORT, never the calling shell.
PID="$(pgrep -f "next-server" | head -1)"
[ -n "$PID" ] && kill -9 "$PID" 2>/dev/null
sleep 2

nohup npx next start -p "$PORT" > "$LOG" 2>&1 &
for _ in $(seq 1 30); do
  if curl -sf --noproxy '*' -o /dev/null "http://localhost:$PORT/"; then
    echo "UP on $PORT"
    exit 0
  fi
  sleep 1
done

echo "FAILED to start; last log lines:"
tail -20 "$LOG"
exit 1
