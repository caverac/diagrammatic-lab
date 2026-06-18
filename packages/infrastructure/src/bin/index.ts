#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'

import { parseEnv } from '../env'
import { GitHubOIDCStack } from '../lib/github-oidc.stack'
import { WebStack } from '../lib/web.stack'

const env = parseEnv(process.env)

// CloudFront certificates must live in us-east-1, so pin everything there.
const awsEnv: cdk.Environment = { account: env.account, region: 'us-east-1' }

const app = new cdk.App()

// The GitHub OIDC provider's ARN is deterministic per account; reuse it when
// the account already has one.
const existingProviderArn = env.reuseGithubOidcProvider
  ? `arn:aws:iam::${env.account}:oidc-provider/token.actions.githubusercontent.com`
  : undefined

// Account-global; deploy once, manually, before CI can authenticate.
new GitHubOIDCStack(app, 'DiagrammaticLab-OIDC', {
  githubRepo: env.githubRepo,
  existingProviderArn,
  env: awsEnv
})

// Each environment is a separate account, so the account is the discriminator
// and the stack needs no environment suffix; ENVIRONMENT only varies the config.
new WebStack(app, 'DiagrammaticLab-Web', {
  environment: env.environment,
  certificateArn: env.certificateArn,
  description: `diagrammatic-lab web (${env.environment})`,
  env: awsEnv
})
