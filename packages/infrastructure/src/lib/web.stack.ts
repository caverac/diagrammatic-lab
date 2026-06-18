import * as path from 'node:path'

import * as cdk from 'aws-cdk-lib'
import * as acm from 'aws-cdk-lib/aws-certificatemanager'
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment'
import { type Construct } from 'constructs'

import { type DeploymentEnvironment } from '../env'

import { getDomainConfig } from './domains'

/** Default location of the built web assets (`packages/web/dist`). */
const DEFAULT_WEB_ASSET_PATH = path.join(__dirname, '..', '..', '..', 'web', 'dist')

export interface WebStackProps extends cdk.StackProps {
  readonly environment: DeploymentEnvironment
  /**
   * ARN of a pre-issued ACM certificate (us-east-1) covering this
   * environment's domains. Issued and DNS-validated out of band because the
   * Route53 hosted zone lives in a different account — see this package's
   * README.
   */
  readonly certificateArn: string
  /** Path to the built static site. Defaults to `packages/web/dist`. */
  readonly webAssetPath?: string
}

/**
 * Hosts the static web app: a private S3 bucket behind a CloudFront
 * distribution using a pre-issued ACM certificate. DNS is intentionally
 * out of scope (the zone is in another account); after deploying, point the
 * domains at the distribution by adding an alias record there — the alias
 * target is the `DistributionDomainName` output.
 *
 * Must be deployed to `us-east-1` (CloudFront certificate requirement).
 */
export class WebStack extends cdk.Stack {
  public readonly bucket: s3.Bucket
  public readonly distribution: cloudfront.Distribution

  constructor(scope: Construct, id: string, props: WebStackProps) {
    super(scope, id, props)

    const { primary, aliases } = getDomainConfig(props.environment)
    const domainNames = [primary, ...aliases]

    const certificate = acm.Certificate.fromCertificateArn(
      this,
      'Certificate',
      props.certificateArn
    )

    this.bucket = new s3.Bucket(this, 'SiteBucket', {
      bucketName: `diagrammatic-lab-web-${props.environment}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      objectOwnership: s3.ObjectOwnership.BUCKET_OWNER_ENFORCED,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    })

    this.distribution = new cloudfront.Distribution(this, 'Distribution', {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        compress: true
      },
      domainNames,
      certificate,
      defaultRootObject: 'index.html',
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      // SPA + hash-routing friendly: serve index.html for not-found paths.
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5)
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: cdk.Duration.minutes(5)
        }
      ]
    })

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      destinationBucket: this.bucket,
      sources: [s3deploy.Source.asset(props.webAssetPath ?? DEFAULT_WEB_ASSET_PATH)],
      distribution: this.distribution,
      distributionPaths: ['/*']
    })

    new cdk.CfnOutput(this, 'SiteUrl', { value: `https://${primary}` })
    new cdk.CfnOutput(this, 'BucketName', { value: this.bucket.bucketName })
    new cdk.CfnOutput(this, 'DistributionId', { value: this.distribution.distributionId })
    // Alias target: in the DNS account, point each domain at this value.
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: this.distribution.distributionDomainName,
      description: 'CloudFront domain to alias the site domains at (in the DNS account)'
    })
    new cdk.CfnOutput(this, 'Domains', { value: domainNames.join(', ') })
  }
}
