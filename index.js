const core = require('@actions/core');
const github = require('@actions/github');

try {
  console.log('This action is not implemented yet!');
  const apiKey = core.getInput('apiKey');
  // Get the JSON webhook payload for the event that triggered the workflow
  const payload = JSON.stringify(github, undefined, 2);
  console.log(`The event payload: ${payload}`);
} catch (error) {
  core.setFailed(error.message);
}