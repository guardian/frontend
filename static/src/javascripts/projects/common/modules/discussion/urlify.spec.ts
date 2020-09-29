

import { urlify } from "./urlify";

describe('urlify', () => {
  it('should convert unlinked urls to urls', () => {
    const post = `
            <a href="http://example.com/existinglink">http://example.com/existinglink</a>
            www.example.com
            <a href="http://example.com/existinglink">http://example.com/existinglink</a>
            www.example.com/test?test#test
            https://example.com
            http://example.com
            asfdahttp://example.com www.example.com
            <a href="http://example.com/existinglink">http://example.com/existinglink</a>`;

    const expected = `
            <a href="http://example.com/existinglink">http://example.com/existinglink</a>
            <a href="http://www.example.com">www.example.com</a>
            <a href="http://example.com/existinglink">http://example.com/existinglink</a>
            <a href="http://www.example.com/test?test#test">www.example.com/test?test#test</a>
            <a href="https://example.com">https://example.com</a>
            <a href="http://example.com">http://example.com</a>
            asfdahttp://example.com <a href="http://www.example.com">www.example.com</a>
            <a href="http://example.com/existinglink">http://example.com/existinglink</a>`;

    expect(urlify(post)).toBe(expected);
  });
});