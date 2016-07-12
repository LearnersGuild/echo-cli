import loadCommand from '../util/loadCommand'
import composeInvoke from '../util/composeInvoke'
import getServiceBaseURL, {GAME} from '../util/getServiceBaseURL'
import errorReporter from '../util/errorReporter'
import graphQLFetcher from '../util/graphQLFetcher'

const questionNames = ['completeness', 'quality']

export const {parse, usage, commandDescriptor} = loadCommand('review')
export const invoke = composeInvoke(parse, usage, (args, notify, options) => {
  const {
    lgJWT,
    lgPlayer,
    formatError,
    formatMessage,
  } = options
  const notifyCallbacks = {
    msg: msg => notify(formatMessage(msg)),
    error: err => notify(formatError(err)),
  }

  if (!lgJWT || !lgPlayer || !lgPlayer.id) {
    return Promise.reject('You are not a player in the game.')
  }
  if (isResponseCommand(args)) {
    return handleProjectReview(lgJWT, args, notifyCallbacks)
      .catch(error => {
        errorReporter.captureException(error)
        notify(formatError(error.message || error))
      })
  }

  if (isStatusCommand(args)) {
    return handleProjectReviewStatus(lgJWT, args, notifyCallbacks)
      .catch(error => {
        errorReporter.captureException(error)
        notify(formatError(error.message || error))
      })
  }

  return Promise.reject('Invalid arguments. Try --help for usage.')
})

function isStatusCommand(args) {
  return args._.length === 1
}

function handleProjectReview(lgJWT, args, {msg}) {
  const projectName = args._[0].replace('#', '')
  const responses = questionNames.map(questionName => ({
    questionName,
    responseParams: [args[questionName]]
  }))

  return invokeSaveProjectReviewCLISurveyResponsesAPI(lgJWT, projectName, responses)
    .then(() => invokeGetProjectReviewSurveyStatusAPI(lgJWT, projectName))
    .then(({completed}) => msg(projectReviewRecordedSuccessMessage(projectName, args, completed)))
}

function invokeSaveProjectReviewCLISurveyResponsesAPI(lgJWT, projectName, responses) {
  const mutation = {
    query: `
mutation($projectName: String!, $responses: [CLINamedSurveyResponse]!) {
  saveProjectReviewCLISurveyResponses(projectName: $projectName, responses: $responses) {
    createdIds
  }
}
    `,
    variables: {projectName, responses},
  }
  return graphQLFetcher(lgJWT, getServiceBaseURL(GAME))(mutation)
    .then(data => data.saveProjectReviewCLISurveyResponses)
}

function projectReviewRecordedSuccessMessage(projectName, args, completed) {
  let msg = ''
  if (args.completeness && args.quality) {
    msg += `Completeness and quality scores captured for #${projectName}!`
  } else if (args.completeness) {
    msg += `Completeness score captured for #${projectName}!`
  } else if (args.quality) {
    msg += `Quality score captured for #${projectName}!`
  }

  if (completed) {
    msg += ' Review is complete. Thank you for your input.'
  } else {
    msg += ' Review is not yet complete.'
  }
  return msg
}

function isResponseCommand(args) {
  return Boolean(questionNames.find(name => args[name]))
}

function handleProjectReviewStatus(lgJWT, args, {msg}) {
  const projectName = args._[0].replace('#', '')

  return invokeGetProjectReviewSurveyStatusAPI(lgJWT, projectName)
    .then(result => msg(projectReviewStatusMessage(projectName, result)))
}

function invokeGetProjectReviewSurveyStatusAPI(lgJWT, projectName) {
  const query = {
    query: `
query($projectName: String!) {
  getProjectReviewSurveyStatus(projectName: $projectName) {
    project { artifactURL }
    completed
    responses {
      questionName
      values {
        value
      }
    }
  }
}
    `,
    variables: {projectName},
  }
  return graphQLFetcher(lgJWT, getServiceBaseURL(GAME))(query)
    .then(data => data.getProjectReviewSurveyStatus)
}

function projectReviewStatusMessage(projectName, status) {
  let statusMessage = ''

  if (status.responses.length > 0) {
    statusMessage += `*Your Review of ${projectName} for this cycle is ${status.completed ? 'complete' : 'not complete'}.*\n\n`
    statusMessage += '_Your Responses are:_\n'
    questionNames.forEach(questionName => {
      const response = status.responses.find(r => r.questionName === questionName)
      if (response) {
        statusMessage += `  • ${questionName}: \`${response.values[0].value}\`\n`
      } else {
        statusMessage += `  • ${questionName}: N/A\n`
      }
    })
  } else {
    statusMessage += `You have not reviewed the ${projectName} project this cycle\n`
  }

  if (!status.completed) {
    if (status.project.artifactURL) {
      statusMessage += `\nThe artifact for the ${projectName} project is here:\n  ${status.project.artifactURL}`
    } else {
      statusMessage += `\nThe artifact URL for the ${projectName} project has not been set by that team.`
    }
  }

  return statusMessage
}

