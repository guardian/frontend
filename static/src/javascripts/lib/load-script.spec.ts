
import { loadScript } from "./load-script";

describe('loadScript', () => {
  const script = document.createElement('script');

  beforeAll(() => {
    if (document.body) {
      document.body.appendChild(script);
    }
  });

  afterAll(() => {
    script.remove();
  });

  test('does not add script if script with matching src already on page, and resolves promise', done => {
    const existingScript = document.createElement('script');

    existingScript.src = 'xxx';

    if (document.body) {
      document.body.appendChild(existingScript);
    }

    expect(document.querySelectorAll('script[src="xxx"]')).toHaveLength(1);

    loadScript('xxx', {}).then(() => {
      expect(document.querySelectorAll('script[src="xxx"]')).toHaveLength(1);

      existingScript.remove();
    }).then(done);
  });

  test('adds script if it is not already on page, and resolves promise when script onload called', done => {
    let scripts = document.querySelectorAll('script[src="xxx"]');

    expect(scripts).toHaveLength(0);

    loadScript('xxx', {}).then(msg => {
      expect(msg).toBe('pass');

      if (scripts[0]) {
        scripts[0].remove();
      }
    }).then(done);

    scripts = document.querySelectorAll('script[src="xxx"]');

    expect(scripts).toHaveLength(1);

    if (scripts[0] && scripts[0].onload) {
      scripts[0].onload('pass');
    }
  });

  test('adds script with attributes if it is not already on page, and resolves promise when script onload called', done => {
    let scripts = document.querySelectorAll('script[src="xxx"]');

    expect(scripts).toHaveLength(0);

    loadScript('xxx', { async: true }).then(msg => {
      // #? having to typecast newScript as scripts[0] is type HTMLElement
      // and async is not valid property of type HTMLElement
      const newScript: HTMLScriptElement = (scripts[0] as any);
      expect(newScript.async).toBeTruthy();
      expect(msg).toBe('pass');
      if (newScript) {
        newScript.remove();
      }
    }).then(done);

    scripts = document.querySelectorAll('script[src="xxx"]');

    expect(scripts).toHaveLength(1);

    if (scripts[0] && scripts[0].onload) {
      scripts[0].onload('pass');
    }
  });

  test('rejects promise when script onerror called', done => {
    let scripts = document.querySelectorAll('script[src="xxx"]');

    expect(scripts).toHaveLength(0);

    loadScript('xxx', {}).catch(err => {
      expect(err.message).toBe('Failed to load script xxx');

      if (scripts[0]) {
        scripts[0].remove();
      }
    }).then(done);

    scripts = document.querySelectorAll('script[src="xxx"]');

    expect(scripts).toHaveLength(1);

    if (scripts[0] && scripts[0].onerror) {
      scripts[0].onerror('fail');
    }
  });
});