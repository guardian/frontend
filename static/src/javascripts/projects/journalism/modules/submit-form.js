// @flow
import fastdom from 'lib/fastdom-promise';
import fetch from 'lib/fetch';

const isCheckbox = element => element.type === 'checkbox';
const isNamed = element => element.name > '';

const showConfirmation = () => {
    const callout = document.querySelector('.element-campaign');
    if (callout) {
        fastdom.write(() => {
            callout.classList.add('success');
        });
    }
};

const showError = cForm => {
    const errorField = cForm.querySelector('.error_box');
    fastdom.write(() => {
        errorField.innerHtml =
            '<p>Sorry, there was a problem submitting your form. Please try again later.</p>';
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

    return fetch('/formstack-campaign/submit', {
        method: 'post',
        body: JSON.stringify(data),
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    }).then(res => {
        if (res.ok) {
            showConfirmation();
        } else {
            showError(cForm);
        }
    });
};
