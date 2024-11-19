#!/usr/bin/env bash

echo "[eslint] executing eslint checks"

npx eslint --fix .

# shellcheck disable=SC2181
if [ $? -ne 0 ]; then
  echo "[eslint] error linting files"
  exit 1
fi

git add --all

exit 0