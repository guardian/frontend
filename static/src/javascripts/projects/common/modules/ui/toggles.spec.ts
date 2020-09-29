
import bean from "bean";
import { Toggles } from "./toggles";

describe('Toggles', () => {
  let componentA;
  let toggles;

  beforeEach(() => {
    if (document.body) {
      document.body.innerHTML = `<div>
                <div id="componentA">
                    <div id="control-1" data-toggle="target-1" class="control">button</div>
                    <div id="control-2" data-toggle="target-2" class="control is-active">button</div>
                    <div id="target-1"  class="target-1 is-off">content</div>
                    <div id="target-2"  class="target-2">content</div>
                </div>
                <div id="componentB">
                    <div id="control-1b" data-toggle="target-1b" class="control">button</div>
                    <div id="control-2b" data-toggle="target-2b" class="control is-active">button</div>
                    <div id="target-1b"  class="target-1 is-off">content</div>
                    <div id="target-2b"  class="target-2">content</div>
                </div>
            </div>`;
    }

    componentA = document.querySelector('#componentA');
    toggles = new Toggles(componentA);
    toggles.init();
  });

  test("Should update the state of a button when clicked (from an initial state of 'off')", () => {
    const control = document.querySelector('#control-1');

    if (control) {
      expect(control.className).not.toContain('is-active');

      bean.fire(control, 'click');

      expect(control.className).toContain('is-active');
    }
  });

  test("Should update the state of a button when clicked (from an initial state of 'on')", () => {
    const control = document.querySelector('#control-2a');

    if (control) {
      expect(control.className).toContain('is-active');

      bean.fire(control, 'click');

      expect(control.className).not.toContain('is-active');
    }
  });

  test('Should toggle the state of a button and when clicked repeatedly', () => {
    const control = document.querySelector('#control-1a');

    if (control) {
      bean.fire(control, 'click');
      expect(control.className).toContain('is-active');

      bean.fire(control, 'click');
      expect(control.className).not.toContain('is-active');

      bean.fire(control, 'click');
      expect(control.className).toContain('is-active');
    }
  });

  test('Deactives its state when another button on the page is activated', () => {
    const control1 = document.querySelector('#control-1');
    const control2 = document.querySelector('#control-2');

    bean.fire(control1, 'click');

    if (control2) {
      expect(control2.className).not.toContain('is-active');
    }
  });

  test('Does not interfere with other control sets', () => {
    const control1 = document.querySelector('#control-1');
    const control1b = document.querySelector('#control-1b');
    const componentB = document.querySelector('#componentB');
    const otherToggles = new Toggles(componentB);

    otherToggles.init();

    bean.fire(control1, 'click');

    if (control1) {
      expect(control1.className).toContain('is-active');
    }

    if (control1b) {
      expect(control1b.className).not.toContain('is-active');
    }
  });

  test('Should reveal its related content', () => {
    const control1 = document.querySelector('#control-1');
    const target1 = document.querySelector('#target-1');

    bean.fire(control1, 'click');

    if (target1) {
      expect(target1.className).not.toContain('is-off');
    }
  });

  test('Should hide any un-related content', () => {
    const control1 = document.querySelector('#control-1');
    const target2 = document.querySelector('#target-2');

    bean.fire(control1, 'click');

    if (target2) {
      expect(target2.className).toContain('is-off');
    }
  });

  test('Should toggle the state of its related content when clicked repeatedly', () => {
    const control1 = document.querySelector('#control-1');
    const target1 = document.querySelector('#target-1');

    if (control1 && target1) {
      bean.fire(control1, 'click');
      expect(target1.className).not.toContain('is-off');

      bean.fire(control1, 'click');
      expect(target1.className).toContain('is-off');

      bean.fire(control1, 'click');
      expect(target1.className).not.toContain('is-off');
    }
  });
});