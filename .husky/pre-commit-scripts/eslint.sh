#!/usr/bin/env bash

echo "[eslint] executing eslint checks"

npx eslint --fix .

# shellcheck disable=SC2181
if [ $? -ne 0 ]; then
  echo "[eslint] error linting files"
  exit 1
fi

<<<<<<< HEAD
<<<<<<< HEAD
git add --all

=======
>>>>>>> b043e08 (chore: replace precommit to use husky)
=======
git add --all

>>>>>>> d2ff610 (chore: add files after format)
exit 0