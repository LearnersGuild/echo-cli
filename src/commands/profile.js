import loadCommand from '../util/loadCommand'
import composeInvoke from '../util/composeInvoke'

export const {parse, usage, commandDescriptor} = loadCommand('profile')

export const invoke = composeInvoke(parse, usage, (args, notify, options) => {
  const {
    formatMessage,
  } = options
  if (args._.length > 0) {
    return Promise.reject('Invalid arguments. Try --help for usage.')
  }

  notify(formatMessage('Loading your profile ...'))
  return Promise.resolve()
})
