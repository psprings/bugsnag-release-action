const core = require('@actions/core');
const github = require('@actions/github');

function getReleaseTag() {
  const release = github.context.payload.release;
  if (release) {
    return release.tag_name;
  }
  return undefined;
}

function generatePayload() {
  const apiKey = core.getInput('apiKey');
  let appVersion = core.getInput('appVersion');
  const metadata = core.getInput('metadata');
  if (appVersion.length > 0) {
    appVersion = getReleaseTag();
  }
  let payload = {
    apiKey: apiKey,
    appVersion: appVersion,
    releaseStage: core.getInput('releaseStage'),
    builderName: github.context.actor,
    sourceControl: {
      provider: "github",
      repository: github.context.payload.repository.html_url,
      revision: github.context.sha
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

try {
  console.log('This action is not implemented yet!');
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github, undefined, 2);
  console.log(`The event payload: ${payload}`);
  let response = await submitRelease();
  console.log(response);
} catch (error) {
  core.setFailed(error.message);
}