
import fastdom from "lib/fastdom-promise";
import fetch from "lib/fetch";
import config from "lib/config";

const targetUrl = config.get('page.calloutsUrl');
const isNamed = element => element.name > '';
const isCheckbox = (element: HTMLInputElement) => element.type === 'checkbox';
const isFile = (element: HTMLInputElement) => element.type === 'file';

/* --------- DOM MANIPULATION ---------*/

const enableButton = cForm => {
  const button: HTMLButtonElement = cForm.getElementsByTagName('button')[0];
  button.disabled = false;
  button.textContent = 'Share with the Guardian';
};

const showConfirmation = cForm => {
  const calloutWrapper = cForm.closest('.element-campaign');
  fastdom.write(() => {
    calloutWrapper.classList.add('success');
  });
};

const showWaiting = cForm => {
  const button = cForm.querySelector('button');
  const errorField = cForm.querySelector('.error_box');
  fastdom.write(() => {
    button.textContent = 'Sending...';
    button.disabled = true;
    errorField.innerHTML = '';
  });
};

const showError = (cForm: HTMLElement, msg: string) => {
  const errorField = cForm.querySelector('.error_box');
  if (errorField) {
    fastdom.write(() => {
      errorField.innerHTML = `<p class="error">${msg}</p>`;
    });
  }
  enableButton(cForm);
};

/* ---------- DATA PARSING ------------*/

const readFile = (file, cForm) => new Promise(res => {
  const reader = new FileReader();
  reader.addEventListener('load', () => {
    const fileAsBase64 = reader.result.toString().split(';base64,')[1];
    // remove data:*/*;base64, from the start of the base64 string
    res(fileAsBase64);
  }, false);
  reader.addEventListener('error', () => {
    showError(cForm, 'Sorry there was a problem with the file you uploaded above. Check the size and type. We only accept images, pdfs and .doc or .docx files');
  });
  reader.readAsDataURL(file);
});

const getValueFromInput = (element, data) => {
  if (isCheckbox(element)) {
    return (data[element.name] || '').concat(`\n${element.value}`);
  } else if (isFile(element) && element.files[0]) {
    const cForm = element.closest('form');
    return readFile(element.files[0], cForm);
  }
  return element.value;
};

export const formatData = (elements: any): Promise<any> => [].reduce.call(elements, async (promise, element) => {
  const data = await promise;
  if (isNamed(element)) {
    const elementValue = await getValueFromInput(element, data);
    data[element.name] = elementValue;
    return data;
  }
  return data;
}, Promise.resolve({}));

export const submitForm = async (e: any) => {
  e.preventDefault();
  const cForm = e.target;
  const data = await formatData(cForm.elements);

  if (data['twitter-handle'].length > 0) {
    showError(cForm, 'Sorry we think you are a robot.');
    return false;
  }

  showWaiting(cForm);

  return fetch(targetUrl, {
    method: 'post',
    body: JSON.stringify(data),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  }).then(res => {
    if (res.ok) {
      showConfirmation(cForm);
    } else {
      showError(cForm, 'Sorry, there was a problem submitting your form. Please try again later.');
    }
  }).catch(() => {
    console.error(`Request to ${targetUrl} failed`);
    showError(cForm, 'Sorry, there was a problem submitting your form. Please try again later.');
  });
};