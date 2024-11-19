#!/usr/bin/env bash

echo "[eslint] executing eslint checks"

npx eslint --fix .

# shellcheck disable=SC2181
if [ $? -ne 0 ]; then
  echo "[eslint] error linting files"
  exit 1
fi

<<<<<<< HEAD
git add --all

=======
>>>>>>> b043e08 (chore: replace precommit to use husky)
exit 0