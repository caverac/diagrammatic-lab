/** Typed parsing of the environment variables the CDK app is driven by. */

import { z } from 'zod'

export type DeploymentEnvironment = 'development' | 'production'

const EnvSchema = z.object({
  ENVIRONMENT: z.enum(['development', 'production']),
  AWS_ACCOUNT: z.string().regex(/^\d{12}$/, 'AWS_ACCOUNT must be a 12-digit account id'),
  AWS_REGION: z.string().min(1).default('us-east-1'),
  GITHUB_REPOSITORY: z.string().min(1),
  ACM_CERTIFICATE_ARN: z
    .string()
    .regex(
      /^arn:aws:acm:us-east-1:\d{12}:certificate\/.+$/,
      'ACM_CERTIFICATE_ARN must be a us-east-1 ACM certificate ARN'
    ),
  // Reuse the account's existing GitHub OIDC provider instead of creating one
  // (AWS allows only one per URL per account).
  REUSE_GITHUB_OIDC_PROVIDER: z.enum(['true', 'false']).default('false')
})

export interface CdkEnv {
  readonly environment: DeploymentEnvironment
  /** Target AWS account id (12 digits). */
  readonly account: string
  /** Target AWS region. CloudFront certificates require `us-east-1`. */
  readonly region: string
  /** GitHub repository in `owner/repo` form, for the OIDC trust policy. */
  readonly githubRepo: string
  /** ARN of a pre-issued ACM certificate (us-east-1) covering the domains. */
  readonly certificateArn: string
  /** Reuse the account's existing GitHub OIDC provider instead of creating one. */
  readonly reuseGithubOidcProvider: boolean
}

/** Parse and validate the CDK environment, throwing on anything missing or malformed. */
export function parseEnv(source: NodeJS.ProcessEnv): CdkEnv {
  const env = EnvSchema.parse(source)
  return {
    environment: env.ENVIRONMENT,
    account: env.AWS_ACCOUNT,
    region: env.AWS_REGION,
    githubRepo: env.GITHUB_REPOSITORY,
    certificateArn: env.ACM_CERTIFICATE_ARN,
    reuseGithubOidcProvider: env.REUSE_GITHUB_OIDC_PROVIDER === 'true'
  }
}
