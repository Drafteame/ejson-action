## v0.5.5 (2024-11-19)


- chore: upgrade deps (#16)
- * chore: replace precommit to use husky

* chore: add files after format

* chore: fix docker build tag

* chore: format

## v0.5.4 (2024-11-19)


- chore: upgrade deps (#15)
- * chore: migrate to eslint 9

* chore: replace precommit to use husky

* chore: add execution permissions to husky scripts

* chore: add files after format

* chore: upgrade docker image

* ci: use commitizen action instad of installing from pip

* chore: exclude husky folder from docker

## v0.5.3 (2024-08-20)


- bump: release 0.5.2 → 0.5.3 [skip-ci]
- chore: add unit test (#14)

## v0.5.2 (2024-08-16)


- bump: release 0.5.1 → 0.5.2 [skip-ci]
- fix: download (#13)
- * fix: pipeline waits on download and decompress streams

* ci: enable test job

* ci: add release job

## v0.5.1 (2024-08-15)


- bump: release 0.5.0 → 0.5.1 [skip-ci]
- refactor: remove promises and use callbacks (#12)

## v0.5.0 (2024-08-12)


- bump: release 0.4.0 → 0.5.0 [skip-ci]
- feat: create new ejson_version input and set to latest if is empty (#11)
- * feat: create new ejson_version input and set to latest if is empty

* chore: save

* fix: correct binary download error

* fix: correct binary download error

* fix: correct binary download error

* fix: correct binary download error using axios

* fix: correct binary download error using axios

* fix: correct binary download error using axiosand targz

* chore: bump dependencies

* refactor: refactor download process

* refactor: refactor download process

* fix: remove dead codes Dockerfiles

* fix: add warning when specified version does not exist

* docs: update README to reflect version parameterization

---------

Co-authored-by: ArielSantos01 <arielg.santos21@gmail.com>

## v0.4.0 (2024-05-21)


- bump: release 0.3.3 → 0.4.0 [skip-ci]
- revert: missing modules (#10)
- * revert: reverting module changes

* ci: change deprecate warning

## v0.3.3 (2024-05-21)


- bump: release 0.3.2 → 0.3.3 [skip-ci]
- fix: base docker image (#9)
- * chore: add tests and docker version tag

* fix: tests

* fix: deps

* fix: change test folder

* ci: npm install from lock

* ci: change action

* ci: fix pipelines

* chore: save

## v0.3.2 (2024-05-21)


- bump: release 0.3.1 → 0.3.2 [skip-ci]
- fix: base docker image (#8)
- * chore: add tests and docker version tag

* fix: tests

* fix: deps

* fix: change test folder

* ci: npm install from lock

* ci: change action

* ci: fix pipelines

* fix: base docker image

## v0.3.1 (2024-05-20)


- bump: release 0.3.0 → 0.3.1 [skip-ci]
- chore: add tests and docker version tag (#7)
- * chore: add tests and docker version tag

* fix: tests

* fix: deps

* fix: change test folder

* ci: npm install from lock

* ci: change action versions

* ci: change action

* chore: add jest config

* ci: fix pipelines

* ci: remove test until fix

## v0.3.0 (2024-04-17)


- bump: release 0.2.2 → 0.3.0 [skip-ci]
- feat: add build and pusblish in registry job (#6)

## v0.2.2 (2024-01-16)


- bump: release 0.2.1 → 0.2.2 [skip-ci]
- fix: finish process with error if commands fail by any reason (#5)

## v0.2.1 (2023-11-03)


- bump: release 0.2.0 → 0.2.1 [skip-ci]
- docs: missing out_file docs (#4)

## v0.2.0 (2023-11-03)


- bump: release 0.1.1 → 0.2.0 [skip-ci]
- feat: add out_file option to create a file for decryption (#3)

## v0.1.1 (2023-11-01)


- bump: release 0.1.0 → 0.1.1 [skip-ci]
- fix: execute (#2)
- * fix: remove binary from source and add it to Docker file

* fix: add documentation on readme

## v0.1.0 (2023-11-01)


- bump: release 0.0.0 → 0.1.0 [skip-ci]
- feat: add first skeleton of the action (#1)
- Initial commit
