const core = require('@actions/core');
const github = require('@actions/github');

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
  const metadata = core.getInput('metadata');
  let payload = {
    apiKey: apiKey,
    appVersion: appVersion,
    releaseStage: core.getInput('releaseStage'),
    builderName: github.context.actor,
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
  let data = generatePayload();
  const response = await fetch('https://build.bugsnag.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    body: JSON.stringify(data)
  });
  return response.json();
}

const release = async () => {
  let response = await submitRelease();
  console.log(response);
}

try {
  const payload = JSON.stringify(github, undefined, 2);
  console.log(`The event payload: ${payload}`);
  release();
} catch (error) {
  core.setFailed(error.message);
}