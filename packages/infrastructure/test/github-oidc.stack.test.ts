import * as cdk from 'aws-cdk-lib'
import { Match, Template } from 'aws-cdk-lib/assertions'

import { GitHubOIDCStack } from '../src/lib/github-oidc.stack'

describe('GitHubOIDCStack', () => {
  let template: Template

  beforeAll(() => {
    const app = new cdk.App()
    const stack = new GitHubOIDCStack(app, 'Oidc', {
      githubRepo: 'caverac/diagrammatic-lab',
      env: { account: '123456789012', region: 'us-east-1' }
    })
    template = Template.fromStack(stack)
  })

  it('creates the GitHub OIDC provider', () => {
    template.hasResourceProperties('Custom::AWSCDKOpenIdConnectProvider', {
      Url: 'https://token.actions.githubusercontent.com',
      ClientIDList: ['sts.amazonaws.com']
    })
  })

  it('creates a deploy role trusting both environments of the repo', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      RoleName: 'DiagrammaticLab-GitHubActions-Role',
      AssumeRolePolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: 'sts:AssumeRoleWithWebIdentity',
            Condition: {
              StringEquals: {
                'token.actions.githubusercontent.com:aud': 'sts.amazonaws.com'
              },
              StringLike: {
                'token.actions.githubusercontent.com:sub': Match.arrayWith([
                  'repo:caverac/diagrammatic-lab:environment:development',
                  'repo:caverac/diagrammatic-lab:environment:production'
                ])
              }
            }
          })
        ])
      })
    })
  })

  it('lets the role assume the CDK bootstrap roles', () => {
    template.hasResourceProperties('AWS::IAM::Policy', {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: 'sts:AssumeRole',
            Resource: 'arn:aws:iam::*:role/cdk-*'
          })
        ])
      })
    })
  })
})

describe('GitHubOIDCStack (reusing an existing provider)', () => {
  const existingProviderArn =
    'arn:aws:iam::123456789012:oidc-provider/token.actions.githubusercontent.com'
  let template: Template

  beforeAll(() => {
    const app = new cdk.App()
    const stack = new GitHubOIDCStack(app, 'Oidc', {
      githubRepo: 'caverac/diagrammatic-lab',
      existingProviderArn,
      env: { account: '123456789012', region: 'us-east-1' }
    })
    template = Template.fromStack(stack)
  })

  it('does not create a new OIDC provider', () => {
    template.resourceCountIs('Custom::AWSCDKOpenIdConnectProvider', 0)
  })

  it('trusts the supplied provider ARN', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      AssumeRolePolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({ Principal: { Federated: existingProviderArn } })
        ])
      })
    })
  })
})
