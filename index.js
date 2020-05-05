const core = require('@actions/core');
const github = require('@actions/github');
const https = require('https');

function getReleaseTag() {
  const release = github.context.payload.release;
  if (release) {
    return release.tag_name;
  }
  return undefined;
}

function getInputOrDynamicDefault(inputKey, defaultValue) {
  let inputValue = core.getInput(inputKey);
  if (inputValue.length > 0) {
    return inputValue;
  }
  return defaultValue;
}

function getDefaultRepository() {
  return github.context.payload.repository.html_url;
}

function getDefaultRevision() {
  return github.context.sha;
}

function generatePayload() {
  const apiKey = core.getInput('apiKey');
  const appVersion = getInputOrDynamicDefault('appVersion', getReleaseTag());
  const repository = getInputOrDynamicDefault('sourceControlRepository', getDefaultRepository());
  const revision = getInputOrDynamicDefault('sourceControlRevision', getDefaultRevision());
  const autoAssignRelease = (core.getInput('autoAssignRelease').toLowerCase() === 'true');
  const metadata = core.getInput('metadata');
  let payload = {
    apiKey: apiKey,
    appVersion: appVersion,
    releaseStage: core.getInput('releaseStage'),
    builderName: github.context.actor,
    autoAssignRelease: autoAssignRelease,
    sourceControl: {
      provider: "github",
      repository: repository,
      revision: revision
    }
  }
  if (metadata.length > 0) {
    payload.metadata = metadata;
  }
  return payload;
}

async function submitRelease() {
  let data = JSON.stringify(generatePayload());
  const options = {
    hostname: 'build.bugsnag.com',
    port: 443,
    path: '/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  }
  
  let responseData = '';
  const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`)
  
    res.on('data', (d) => {
      responseData += d;
    })

    res.on('end', () => {
      console.log(JSON.parse(responseData).explanation);
    });
  })
  
  req.on('error', (error) => {
    console.error(error)
  })
  
  req.write(data)
  req.end()
}

try {
  if (process.env.DEBUG === 'true') {
    const payload = JSON.stringify(github, undefined, 2);
    console.log(`The event payload: ${payload}`);
  }
  submitRelease();
} catch (error) {
  core.setFailed(error.message);
}
