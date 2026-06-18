import { type DeploymentEnvironment } from '../env'

/** The registrable domain whose Route53 hosted zone hosts every environment. */
export const ROOT_DOMAIN = 'diagrammatic-lab.com'

export interface DomainConfig {
  /** The primary domain this environment serves. */
  readonly primary: string
  /** Additional aliases also served (e.g. `www`). */
  readonly aliases: readonly string[]
}

/**
 * The domains for an environment: production owns the apex (plus `www`),
 * development lives on the `dev.` subdomain.
 */
export function getDomainConfig(environment: DeploymentEnvironment): DomainConfig {
  if (environment === 'production') {
    return { primary: ROOT_DOMAIN, aliases: [`www.${ROOT_DOMAIN}`] }
  }
  return { primary: `dev.${ROOT_DOMAIN}`, aliases: [] }
}
