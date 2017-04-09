# game-cli

[![Code Climate GPA](https://codeclimate.com/repos/579a59533f9350008b001b86/badges/204a213385078563eb5d/gpa.svg)](https://codeclimate.com/repos/579a59533f9350008b001b86/feed)
[![Code Climate Issue Count](https://codeclimate.com/repos/579a59533f9350008b001b86/badges/204a213385078563eb5d/issue_count.svg)](https://codeclimate.com/repos/579a59533f9350008b001b86/feed)
[![Test Coverage](https://codeclimate.com/repos/579a59533f9350008b001b86/badges/204a213385078563eb5d/coverage.svg)](https://codeclimate.com/repos/579a59533f9350008b001b86/coverage)

Learners Guild game command-line interface (CLI).


## Getting Started

Read the [instructions for contributing](./CONTRIBUTING.md).

1. **Globally** install [nvm][nvm], [avn][avn], and [avn-nvm][avn-nvm].

    ```bash
    curl -o- https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
    npm install -g avn avn-nvm
    avn setup
    ```

2. Clone the repository.

3. Run the setup tasks:

        $ npm install
        $ npm test

### How to Define New Commands

All of the existing top-level commands are defined in the [config/commands](config/commands) folder, one `.yaml` file per command. To add a new command, simply create a `.yaml` file with the name of the command. Each command and subcommand supports the following attributes:

- `name` primary name of option
- `abbr` one character alias of the option
- `alias` other options treated as alias
- `boolean` if `true`, the option is seen as a boolean flag
- `help` usage string for the option
- `default` default value of the option
- `commands` nested subcommands, which also support this same list of attributes
- `_inactive` if `true`, the command or subcommand will be ignored

It's worth noting that the attributes are an extension of [cliclopts][cliclopts].

## How to Use

1. Install the module in your project

        $ npm install --save @learnersguild/game-cli

2. Use whichever command modules you want by importing them

      ```javascript
      import {vote} from '@learnersguild/game-cli'

      const args = vote.parse(['44', '45'])
      const usageText = vote.usage(args)
      if (usageText) {
        console.info(usageText)
        return 1
      }

      // ... do something with args to make voting happen
      ```

### The Command Runner

There's a built-in command-runner that can be used for development / testing. It is implemented in [/src/runner.js](/src/runner.js), and can be invoked as an npm script:

        $ npm run command -- vote 44 45

The command runner supports different ways to authenticate / impersonate. The easiest way is to find the `CLI_COMMAND_TOKEN` environment variable, and send it along with the desired `handle` for the user as whom you'd like to authenticate. For example:

        $ npm run command -- --token=abcd1234zyxw9876 --handle=joeschmoe vote 44 45

If you don't pass the `handle` option, the command runner will try to deduce it from your `~/.gitconfig` by pulling the `user` attribute from the `[github]` section.

Alternatively, you can authenticate using a non-expired JWT that you can steal from your browser cookie using the browser developer tools. To do this, you can either pass that JWT along via the `lgJWT` option. For example:

        $ npm run command -- --lgJWT=<SUPER LONG TOKEN> vote 44 45

If you don't pass the `lgJWT` option, the command runner will try to deduce it from a `~/.lgrc` file that looks something like this:

```json
{
  "lgJWT" : "<LONG SSO JWT TOKEN>",
}
```


## Notes

It may help to look at [subcli][subcli] for more detail on how the argument parsing is handled.

## License

See the [LICENSE](./LICENSE) file.


[subcli]: https://github.com/LearnersGuild/subcli
[cliclopts]: https://github.com/finnp/cliclopts
[nvm]: https://github.com/creationix/nvm
[avn]: https://github.com/wbyoung/avn
[avn-nvm]: https://github.com/wbyoung/avn-nvm
