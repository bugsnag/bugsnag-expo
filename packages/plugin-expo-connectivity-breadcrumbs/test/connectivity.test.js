const Client = require('@bugsnag/core/client')
const NetInfo = require('@react-native-community/netinfo')
const plugin = require('../')

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn()
}))

describe('plugin: expo connectivity breadcrumbs', () => {
  beforeEach(() => {
    NetInfo.addEventListener.mockClear()
  })

  it('should create a breadcrumb when NetInfo events happen', () => {
    const client = new Client({ apiKey: 'aaaa-aaaa-aaaa-aaaa', plugins: [plugin] })
    expect(client).toBe(client)

    expect(NetInfo.addEventListener).toHaveBeenCalledWith(expect.any(Function))
    expect(client._breadcrumbs.length).toBe(0)

    const _cb = NetInfo.addEventListener.mock.calls[0][0]

    _cb({ type: 'wifi', isConnected: true, isInternetReachable: true })
    expect(client._breadcrumbs.length).toBe(1)
    expect(client._breadcrumbs[0].type).toBe('state')
    expect(client._breadcrumbs[0].message).toBe('Connectivity changed')
    expect(client._breadcrumbs[0].metadata).toEqual({ type: 'wifi', isConnected: true, isInternetReachable: true })

    _cb({ type: 'none', isConnected: false, isInternetReachable: false })
    expect(client._breadcrumbs.length).toBe(2)
    expect(client._breadcrumbs[1].type).toBe('state')
    expect(client._breadcrumbs[1].message).toBe('Connectivity changed')
    expect(client._breadcrumbs[1].metadata).toEqual({ type: 'none', isConnected: false, isInternetReachable: false })
  })

  it('should be enabled when enabledBreadcrumbTypes=null', () => {
    const client = new Client({ apiKey: 'aaaa-aaaa-aaaa-aaaa', enabledBreadcrumbTypes: null, plugins: [plugin] })
    expect(client).toBe(client)

    expect(NetInfo.addEventListener).toHaveBeenCalledWith(expect.any(Function))
  })

  it('should not be enabled when enabledBreadcrumbTypes=[]', () => {
    const client = new Client({ apiKey: 'aaaa-aaaa-aaaa-aaaa', enabledBreadcrumbTypes: [], plugins: [plugin] })
    expect(client).toBe(client)

    expect(NetInfo.addEventListener).not.toHaveBeenCalled()
  })

  it('should be enabled when enabledBreadcrumbTypes=["state"]', () => {
    const client = new Client({ apiKey: 'aaaa-aaaa-aaaa-aaaa', enabledBreadcrumbTypes: ['state'], plugins: [plugin] })
    expect(client).toBe(client)

    expect(NetInfo.addEventListener).toHaveBeenCalledWith(expect.any(Function))
  })
})
