
import { addClassesAndTitle } from "./svg";

describe('svg.addClassesAndTitle', () => {
  test('leaves markup alone if only markup passed', () => {
    expect(addClassesAndTitle('<span></span>')).toBe('<span></span>');
  });

  test('adds all classes passed in', () => {
    expect(addClassesAndTitle('<span class="foo"></span>', ['bar', 'baz'])).toBe('<span class="bar baz foo"></span>');
  });

  test('adds title if present', () => {
    expect(addClassesAndTitle('<span class="foo"></span>', ['bar', 'baz'], 'the title')).toBe('<span title="the title" class="bar baz foo"></span>');
  });
});