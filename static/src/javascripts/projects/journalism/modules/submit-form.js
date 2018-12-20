// @flow
import fastdom from 'lib/fastdom-promise';
import fetch from 'lib/fetch';

const isCheckbox = element => element.type === 'checkbox';
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

const showError = cForm => {
    const errorField = cForm.querySelector('.error_box');
    fastdom.write(() => {
        errorField.innerHTML =
            '<p class="error">Sorry, there was a problem submitting your form. Please try again later.</p>';
    });
    enableButton(cForm);
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

export const formatData = (elements: any) =>
    [].reduce.call(
        elements,
        (data, element) => {
            if (isNamed(element)) {
                if (isCheckbox(element)) {
                    data[element.name] = (data[element.name] || '').concat(
                        `\n${element.value}`
                    );
                } else {
                    data[element.name] = element.value;
                }
            }
            return data;
        },
        {}
    );

export const submitForm = (e: any) => {
    e.preventDefault();
    const cForm = e.target;
    const data = formatData(cForm.elements);
    showWaiting(cForm);

    return fetch('/formstack-campaign/submit', {
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
            showError(cForm);
        }
    });
};
