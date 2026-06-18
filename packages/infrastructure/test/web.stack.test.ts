import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'

import * as cdk from 'aws-cdk-lib'
import { Match, Template } from 'aws-cdk-lib/assertions'

import { type DeploymentEnvironment } from '../src/env'
import { WebStack } from '../src/lib/web.stack'

const CERTIFICATE_ARN = 'arn:aws:acm:us-east-1:123456789012:certificate/abc-123'

let webAssetPath: string

beforeAll(() => {
  webAssetPath = fs.mkdtempSync(path.join(os.tmpdir(), 'dl-web-'))
  fs.writeFileSync(path.join(webAssetPath, 'index.html'), '<!doctype html><title>t</title>')
})

function synth(environment: DeploymentEnvironment): Template {
  const app = new cdk.App()
  const stack = new WebStack(app, `Web-${environment}`, {
    environment,
    certificateArn: CERTIFICATE_ARN,
    webAssetPath,
    env: { account: '123456789012', region: 'us-east-1' }
  })
  return Template.fromStack(stack)
}

describe('WebStack (production)', () => {
  let template: Template
  beforeAll(() => {
    template = synth('production')
  })

  it('creates a private, env-named site bucket', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketName: 'diagrammatic-lab-web-production',
      PublicAccessBlockConfiguration: Match.objectLike({ BlockPublicPolicy: true })
    })
  })

  it('serves the apex and www through CloudFront with the imported certificate', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        Aliases: Match.arrayWith(['diagrammatic-lab.com', 'www.diagrammatic-lab.com']),
        DefaultRootObject: 'index.html',
        ViewerCertificate: Match.objectLike({ AcmCertificateArn: CERTIFICATE_ARN })
      })
    })
  })

  it('does not provision a certificate or DNS records (managed elsewhere)', () => {
    template.resourceCountIs('AWS::CertificateManager::Certificate', 0)
    template.resourceCountIs('AWS::Route53::RecordSet', 0)
  })

  it('routes SPA fallbacks to index.html', () => {
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({
        CustomErrorResponses: Match.arrayWith([
          Match.objectLike({ ErrorCode: 403, ResponseCode: 200, ResponsePagePath: '/index.html' })
        ])
      })
    })
  })

  it('outputs the CloudFront alias target', () => {
    template.hasOutput('DistributionDomainName', {})
  })
})

describe('WebStack (development)', () => {
  let template: Template
  beforeAll(() => {
    template = synth('development')
  })

  it('uses the dev bucket and subdomain', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketName: 'diagrammatic-lab-web-development'
    })
    template.hasResourceProperties('AWS::CloudFront::Distribution', {
      DistributionConfig: Match.objectLike({ Aliases: ['dev.diagrammatic-lab.com'] })
    })
  })
})
