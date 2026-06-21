import { getDomainConfig } from '@infra/lib/domains'

describe('getDomainConfig', () => {
  it('serves the apex and www in production', () => {
    expect(getDomainConfig('production')).toEqual({
      primary: 'diagrammatic-lab.com',
      aliases: ['www.diagrammatic-lab.com']
    })
  })

  it('serves the dev subdomain in development', () => {
    expect(getDomainConfig('development')).toEqual({
      primary: 'dev.diagrammatic-lab.com',
      aliases: []
    })
  })
})
