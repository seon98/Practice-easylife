#!/usr/bin/env sh
set -eu

: "${FRONTEND_URL:?Set FRONTEND_URL}"
: "${API_URL:?Set API_URL}"

for path in / /services /services/1 /login /favorites; do
  curl --fail --silent --show-error "${FRONTEND_URL}${path}" >/dev/null
done
for path in /health /health/ready /api/v1/services /api/v1/services/1; do
  curl --fail --silent --show-error "${API_URL}${path}" >/dev/null
done
printf 'Production smoke test passed.\n'
