import loadCommand from '../util/loadCommand'
import composeInvoke from '../util/composeInvoke'

export const {parse, usage, commandDescriptor} = loadCommand('retro')

export const invoke = composeInvoke(parse, usage, (args, notify, options) => {
  const {
    formatMessage,
  } = options
  if (args._.length > 1) {
    return Promise.reject('Invalid arguments. Try --help for usage.')
  }

  const projectName = args._.length === 1 ? args._[0].replace('#', '') : null
  const loadingMessage = projectName ?
  `Looking for retrospective survey for #${projectName} ...` :
  'Looking for retrospective survey ...'
  notify(formatMessage(loadingMessage))
  return Promise.resolve()
})
