import path from 'path'
import fs from 'fs'
import util from 'util'
import minimist from 'minimist'
import gitConfig from 'git-config'
import fetch from 'isomorphic-fetch'
import encodeAsForm from 'form-urlencoded'

const LGRC_FILENAME = path.join(process.env.HOME, '.lgrc')

function getOptions(opts) {
  const options = {
    appBaseURL: (process.env.NODE_ENV === 'production' ?
      'https://echo.learnersguild.org' :
      'http://echo.learnersguild.dev'),
  }
  if (opts.token) {
    if (!opts.handle) {
      const {github: {user: handle}} = gitConfig.sync()
      options.handle = handle
    }
  } else if (!opts.lgJWT) {
    try {
      const stats = fs.statSync(LGRC_FILENAME)
      if (stats.isFile()) {
        const userOptions = JSON.parse(fs.readFileSync(LGRC_FILENAME).toString())
        options.lgJWT = userOptions.lgJWT
        options.handle = userOptions.lgUser.handle
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err
      }
      // ignore -- couldn't find LGRC_FILENAME
    }
  }

  return options
}

function invokeCommandAPI(command, text, options) {
  const apiURL = `${options.appBaseURL}/command`
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json',
  }
  if (options.lgJWT) {
    headers.Authorization = `Bearer ${options.lgJWT}`
  }
  const body = {
    command: `/${command}`,
    text,
  }
  if (options.handle && options.token) {
    body.token = options.token
    body.user_name = options.handle // eslint-disable-line camelcase
  }
  return fetch(apiURL, {
    method: 'POST',
    headers,
    body: encodeAsForm(body),
  })
    .then(resp => {
      return resp.json()
        .then(result => {
          if (resp.ok) {
            return result
          }
          const err = new Error(result.text || result)
          err.result = result
          throw err
        })
        .catch(err => {
          console.error(`ERROR invoking ${apiURL}: ${resp.status} ${resp.statusText}`)
          throw err
        })
    })
}

function run(opts, argv) {
  const options = {...getOptions(opts), ...opts}
  if (!options.lgJWT) {
    if (!options.handle && !options.token) {
      throw new Error('You must authenticate. Try --help.')
    }
  }
  const [commandName, ...args] = argv
  return invokeCommandAPI(commandName, args.join(' '), options)
}

function printResult(result, log = console.info) {
  if (!result.text) {
    log(util.inspect(result, {depth: 4}))
    return
  }
  log(result.text)
  const attachmentTexts = (result.attachments || []).map(attachment => attachment.text)
  if (attachmentTexts.length > 0) {
    log('-> ', attachmentTexts.join('\n-> '))
  }
}

function usage() {
  return `
Usage: npm run command -- [opts] CMD [cmd-opts] [SUBCMD [subcmd-opts]]

Options:
  --help             Print this help message

Auth using token and handle:
  --token=TOKEN      CLI command token to send to the API

  --handle=HANDLE    run command as the user with this handle
                     (may also be read from ~/.gitconfig file)

Auth using JWT:
  --lgJWT=JWT        Learners Guild JWT to use as authentication
                     (may also be read from ~/.lgrc file)
`
}

if (!module.parent) {
  /* eslint-disable xo/no-process-exit */
  const argv = process.argv.slice(2)
  const cmdIdx = argv.findIndex(arg => !arg.match(/^-/))
  const runArgv = argv.slice(0, (cmdIdx >= 0 ? cmdIdx : argv.length + 1))
  const cmdArgv = argv.slice(cmdIdx)
  const opts = minimist(runArgv)
  if (opts.help) {
    console.info(usage())
    process.exit(0)
  }
  const {help, _, ...filteredOpts} = opts // eslint-disable-line no-unused-vars
  run(filteredOpts, cmdArgv)
    .then(result => {
      printResult(result)
      process.exit(0)
    })
    .catch(err => {
      if (err.result) {
        printResult(err.result, console.error)
      } else {
        console.error(err.stack || err.message || err)
      }
      process.exit(-1)
    })
}
