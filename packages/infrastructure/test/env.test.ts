import { parseEnv } from '../src/env'

const base = {
  ENVIRONMENT: 'development',
  AWS_ACCOUNT: '123456789012',
  GITHUB_REPOSITORY: 'caverac/diagrammatic-lab',
  ACM_CERTIFICATE_ARN: 'arn:aws:acm:us-east-1:123456789012:certificate/abc-123'
}

describe('parseEnv', () => {
  it('parses a complete environment and defaults the region to us-east-1', () => {
    const env = parseEnv({ ...base })
    expect(env.environment).toBe('development')
    expect(env.account).toBe('123456789012')
    expect(env.region).toBe('us-east-1')
    expect(env.certificateArn).toBe('arn:aws:acm:us-east-1:123456789012:certificate/abc-123')
  })

  it('honours an explicit region', () => {
    expect(parseEnv({ ...base, AWS_REGION: 'eu-west-1' }).region).toBe('eu-west-1')
  })

  it('throws when a required variable is missing', () => {
    expect(() => parseEnv({ ...base, AWS_ACCOUNT: undefined })).toThrow(/AWS_ACCOUNT/)
  })

  it('throws on an unknown environment', () => {
    expect(() => parseEnv({ ...base, ENVIRONMENT: 'staging' })).toThrow(/ENVIRONMENT/)
  })

  it('rejects a certificate ARN outside us-east-1', () => {
    const arn = 'arn:aws:acm:eu-west-1:123456789012:certificate/abc-123'
    expect(() => parseEnv({ ...base, ACM_CERTIFICATE_ARN: arn })).toThrow(/ACM_CERTIFICATE_ARN/)
  })

  it('defaults to creating the OIDC provider, with an opt-in to reuse', () => {
    expect(parseEnv({ ...base }).reuseGithubOidcProvider).toBe(false)
    expect(parseEnv({ ...base, REUSE_GITHUB_OIDC_PROVIDER: 'true' }).reuseGithubOidcProvider).toBe(
      true
    )
  })
})
