
import dfpOrigin from "./dfp-origin";

describe('Cross-frame messenger: dfpOrigin', () => {
  it('should exist', () => {
    expect(dfpOrigin).toBeDefined();
  });

  // Scripts coming from DFP _NEED_ to have access to this as a DEFAULT EXPORT
  it('should have the URL as the default export', () => {
    const url = `${window.location.protocol}//tpc.googlesyndication.com`;
    expect(dfpOrigin).toBe(url);
  });
});