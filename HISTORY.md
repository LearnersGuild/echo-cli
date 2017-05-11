# History

#### 2.1.3

- In `cycle init`, change hours from an option to an argument.

#### 1.3.0
- Add `--hours` option for `cycle init`.

#### 1.2.0
- Adding playbook command

#### 1.1.5
- allow moderators to issue project list subcommand

#### 1.1.4
- Fix bug when submitting a partial project review

#### 1.1.0
- add `/project list` subcommand

#### 1.0.0
- add `/retro` command
- remove `/log` command
- update `/review` command to match game API changes related to new-retro

#### 0.14.0
- stop expecting `lgPlayer` -- use `lgUser` and `lgUser.roles`

#### 0.13.3
- bump subcli to 0.2.3

#### 0.13.2
- fixup `/vote` usage

#### 0.13.0
- Added support for specifying project name in `/log` commands
- Upgrading to subcli 0.2.2 and making use of the `commandPrefix` and `maxWidth` options.

#### 0.12.0
- Added support for getting project review status info via `/review #project-name`
- Added status info to the output when you submit a project review.

#### 0.11.1
- cycle: don't print help unless asked for (fixes #37)
- fix typo (fixes #45)

#### 0.11.0
`/review` added

#### 0.10.0
`/project set-artifact` added

#### 0.9.2
`/cycle init` error handling bug fix

#### 0.9.1
`/cycle init` wording tweak

#### 0.9.0
Adding `/cycle init`

#### 0.8.3
Added status information to `/log --retro` output

#### 0.8.0
Changed `/cycle retro` to `/cycle reflect`

#### 0.7.1
Adding implemntations for `/log --retro` and `/log --retro -q NUM`
