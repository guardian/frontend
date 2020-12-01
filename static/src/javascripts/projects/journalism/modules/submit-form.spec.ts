

import { formatData } from "journalism/modules/submit-form";

let mockFormEls: NodeListOf<HTMLElement>;

describe('Submitting a callout response to formstack', () => {
  beforeEach(() => {
    if (document.body) {
      document.body.innerHTML = '<form method="post" id="testform"> <input name="field1" type="text" value="hi"> <input name="field2" type="textarea" value="hello"> <input type="checkbox" value="Option1" name="field3" checked><input type="checkbox" value="Option2" name="field3" checked> <button type="submit">submit this</button> </form>';
      mockFormEls = document.querySelectorAll('input');
    }
  });

  afterEach(() => {
    if (document.body) {
      document.body.innerHTML = '';
    }
  });

  it('takes the form data and turns it into a javascript object', () => {
    const mockData = {
      field1: 'hi',
      field2: 'hello',
      field3: '\nOption1\nOption2'
    };
    formatData(mockFormEls).then(res => {
      expect(res).toEqual(mockData);
    });
  });
});
