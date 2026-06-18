# @diagrammatic-lab/infrastructure

AWS CDK infrastructure for deploying the web app, plus the GitHub Actions OIDC
role that lets CI deploy without long-lived credentials.

## Stacks

| Stack                  | What it is                                                           |
| ---------------------- | -------------------------------------------------------------------- |
| `DiagrammaticLab-OIDC` | GitHub OIDC provider + IAM deploy role (account-global, deploy once) |
| `DiagrammaticLab-Web`  | S3 + CloudFront for the static site                                  |

Each environment is a **separate AWS account**, so the account is the
discriminator — there's a single `DiagrammaticLab-Web` stack per account, and
`ENVIRONMENT` only varies the config (production serves `diagrammatic-lab.com` +
`www`; development serves `dev.diagrammatic-lab.com`). Everything is pinned to
**us-east-1** (CloudFront requires its certificate there).

## DNS is out of scope (different account)

The Route53 hosted zone for `diagrammatic-lab.com` lives in a **separate AWS
account**, so the web stack does **not** create the certificate or any DNS
records. Instead it consumes a **pre-issued ACM certificate** (by ARN) and
outputs the CloudFront domain; we need the point the domains at it once, by hand, in the
DNS account.

## Environment variables

The CDK app (`src/bin/index.ts`) reads:

| Variable              | Example                                            | Notes                               |
| --------------------- | -------------------------------------------------- | ----------------------------------- |
| `ENVIRONMENT`         | `development` / `production`                       | selects the web stack               |
| `AWS_ACCOUNT`         | `123456789012`                                     | deploy account                      |
| `AWS_REGION`          | `us-east-1`                                        | defaults to `us-east-1`             |
| `GITHUB_REPOSITORY`   | `caverac/diagrammatic-lab`                         | OIDC trust subject (auto-set in CI) |
| `ACM_CERTIFICATE_ARN` | `arn:aws:acm:us-east-1:123456789012:certificate/…` | pre-issued cert (see below)         |

`REUSE_GITHUB_OIDC_PROVIDER` (optional, `true`/`false`, default `false`) — set to
`true` when the account already has a GitHub OIDC provider (AWS allows only one
per account); the OIDC stack then imports it instead of creating a duplicate.

## One-time setup

1. **Issue the certificate** and note its ARN — see
   [Getting `ACM_CERTIFICATE_ARN`](#getting-acm_certificate_arn) below.

2. **Bootstrap CDK** (admin credentials):

   ```bash
   yarn workspace @diagrammatic-lab/infrastructure cdk bootstrap aws://<account>/us-east-1
   ```

3. **Deploy the OIDC stack once** (admin credentials). Add
   `REUSE_GITHUB_OIDC_PROVIDER=true` if the account already has a GitHub OIDC
   provider:

   ```bash
   ENVIRONMENT=development AWS_ACCOUNT=<account> \
   GITHUB_REPOSITORY=caverac/diagrammatic-lab \
   ACM_CERTIFICATE_ARN=<arn> \
   REUSE_GITHUB_OIDC_PROVIDER=true \
   yarn workspace @diagrammatic-lab/infrastructure cdk deploy DiagrammaticLab-OIDC
   ```

4. **GitHub** — create Environments `development` and `production`
   (Settings → Environments), and set these **variables** on each:
   - `AWS_ACCOUNT_ID`
   - `ACM_CERTIFICATE_ARN`

5. **Point DNS at CloudFront** (DNS account, after the first web deploy). Read
   the stack's `DistributionDomainName` output (e.g. `dxxxx.cloudfront.net`) and,
   in the DNS account's zone, add an **alias `A`/`AAAA`** (or a `CNAME`) for each
   domain targeting it.

After that, CI deploys via two workflows:

- **`deploy-development.yml`** — push to `main` → deploys `development`.
- **`deploy-production.yml`** — push a `release-x.y.z` branch → deploys
  `production`. Production is a deliberate action: cut and push the release
  branch when you're ready to ship.

`release.yml` (semantic-release) handles versioning and the changelog on `main`;
it does not drive deploys.

## Getting `ACM_CERTIFICATE_ARN`

The certificate is **not** created by CDK — it's a standalone ACM resource you
issue once. Because the Route53 zone is in a **different account**, you request
the cert in the **deploy account (us-east-1)** and add the validation records in
the **DNS account**. Issue one cert per environment:

- **production** → `diagrammatic-lab.com` + `www.diagrammatic-lab.com`
- **development** → `dev.diagrammatic-lab.com`

> The cert must be in **us-east-1** (CloudFront requirement) and **Issued**
> before you deploy the web stack. Run these against the deploy account's
> credentials.

### CLI

```bash
# 1. Deploy account, us-east-1: request the cert for the environment you're
#    issuing (each is a separate account). Prints the ARN immediately
#    (status PENDING_VALIDATION) — this is ACM_CERTIFICATE_ARN.

# development:
aws acm request-certificate --region us-east-1 --domain-name dev.diagrammatic-lab.com --validation-method DNS --query CertificateArn --output text

# production:
aws acm request-certificate --region us-east-1 --domain-name diagrammatic-lab.com --subject-alternative-names www.diagrammatic-lab.com --validation-method DNS --query CertificateArn --output text

# 2. Read the validation CNAMEs ACM wants (Name / Value per domain):
aws acm describe-certificate --region us-east-1 --certificate-arn <arn-from-step-1> --query 'Certificate.DomainValidationOptions[].ResourceRecord' --output table

# 3. DNS account: add each CNAME (Name -> Value) to the diagrammatic-lab.com
#    hosted zone (Route53 console, or change-resource-record-sets).

# 4. Wait until ACM reports ISSUED:
aws acm wait certificate-validated --region us-east-1 --certificate-arn <arn-from-step-1>
```

Each environment gets its own ARN.

### Console

ACM (us-east-1) → **Request certificate** → public → add the domain names → **DNS
validation** → request. On the certificate page copy each **CNAME name/value**
into the DNS account's Route53 zone; when the status is **Issued**, copy the
**ARN** from the top of the page.

Once issued, ACM auto-renews as long as the validation `CNAME`s stay in the zone.

## Local commands

```bash
# build the site first, then point at the target account's credentials
yarn workspace @diagrammatic-lab/web build

ENVIRONMENT=development AWS_ACCOUNT=<acct> GITHUB_REPOSITORY=caverac/diagrammatic-lab \
ACM_CERTIFICATE_ARN=<arn> \
yarn workspace @diagrammatic-lab/infrastructure cdk diff DiagrammaticLab-Web

ENVIRONMENT=development AWS_ACCOUNT=<acct> GITHUB_REPOSITORY=caverac/diagrammatic-lab \
ACM_CERTIFICATE_ARN=<arn> \
yarn workspace @diagrammatic-lab/infrastructure cdk deploy DiagrammaticLab-Web
```
