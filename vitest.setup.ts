class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

type ResizeObserverCtor = new () => {
  observe: typeof ResizeObserverStub.prototype.observe
  unobserve: typeof ResizeObserverStub.prototype.unobserve
  disconnect: typeof ResizeObserverStub.prototype.disconnect
}

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = ResizeObserverStub as unknown as ResizeObserverCtor
}

if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}
