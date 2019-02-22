// @flow
import fastdom from 'lib/fastdom-promise';
import fetch from 'lib/fetch';

const isCheckbox = element => element.type === 'checkbox';
const isFile = element => element.type === 'file';
const isNamed = element => element.name > '';

const disableButton = button => {
    button.disabled = true;
};

const enableButton = cForm => {
    const button = cForm.querySelector('button');
    button.disabled = false;
    button.textContent = 'Share with the Guardian';
};

const showConfirmation = cForm => {
    const calloutWrapper = cForm.closest('.element-campaign');
    if (calloutWrapper) {
        fastdom.write(() => {
            calloutWrapper.classList.add('success');
        });
    }
};

const showError = (cForm, msg) => {
    const errorField = cForm.querySelector('.error_box');
    fastdom.write(() => {
        errorField.innerHTML = `<p class="error">${msg}</p>`;
    });
    enableButton(cForm);
};

const showFileUploadError = (el, msg) => {
    fastdom.write(() => {
        const errorBox = document.createElement('p');
        errorBox.textContent = msg;
        errorBox.classList.add('error');
        el.appendChild(errorBox);
    });
};

const showWaiting = cForm => {
    const button = cForm.querySelector('button');
    const errorField = cForm.querySelector('.error_box');
    fastdom.write(() => {
        button.textContent = 'Sending...';
        disableButton(button);
        errorField.innerHTML = '';
    });
};

const readFile = (file, inputEl) =>
    new Promise(res => {
        const reader = new FileReader();
        reader.addEventListener(
            'load',
            () => {
                // remove 'data:*/*;base64,' from the start of the string
                // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
                const fileAsBase64 = reader.result
                    .toString()
                    .split('base64,')[1];
                res(fileAsBase64);
            },
            false
        );
        reader.addEventListener('error', () => {
            showFileUploadError(
                inputEl,
                'Sorry there was a problem with your file: we accept images, pdfs and .doc or .docx files'
            );
        });
        reader.readAsDataURL(file);
    });

const getValueFromInput = (element, data) => {
    if (isCheckbox(element)) {
        return (data[element.name] || '').concat(`\n${element.value}`);
    } else if (isFile(element) && element.files[0]) {
        return readFile(element.files[0], element);
    }
    return element.value;
};

export const formatData = (elements: any): Promise<any> =>
    [].reduce.call(
        elements,
        async (promise, element) => {
            const data = await promise;
            if (isNamed(element)) {
                const elementValue = await getValueFromInput(element, data);
                data[element.name] = elementValue;
                return data;
            }
            return data;
        },
        Promise.resolve({})
    );

export const submitForm = async (e: any) => {
    e.preventDefault();
    const cForm = e.target;
    const data = await formatData(cForm.elements);

    if (data['twitter-handle'].length > 0) {
        showError(cForm, 'Sorry we think you are a robot.');
        return false;
    }
    showWaiting(cForm);

    return fetch('https://callouts.code.dev-guardianapis.com', {
        method: 'post',
        body: JSON.stringify(data),
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    }).then(res => {
        if (res.ok) {
            showConfirmation(cForm);
        } else {
            showError(
                cForm,
                'Sorry, there was a problem submitting your form. Please try again later.'
            );
        }
    });
};
