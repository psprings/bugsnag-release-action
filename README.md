# bugsnag-release-action

Notify Bugsnag of a release/deployment

## Inputs

### `apiKey`

**Required** The Bugsnag API Key for your project.

### `appVersion`

The version of the application that you are deploying. If action is triggered by a release, it will use the tag by default.

### `metadata`

Optional metadata tags pertinent to the release
    required: false

### `releaseStage`

This identifies the unique stage/environment that the application code has been released to. Defaults to `production`

## Example usage

```yaml
uses: psprings/bugsnag-release-action@v0.0.3
with:
  apiKey: 'APIKEYHERE'
```