const classes = {
    formError: '.form__error',
    formSuccess: '.form__success',
};

const prependMessage = (
    message,
    location,
    clazz
) => {
    const errorHtml = document.createElement('div');
    errorHtml.innerHTML = message;
    errorHtml.className = clazz;
    errorHtml.setAttribute('role', 'alert');
    errorHtml.setAttribute('aria-live', 'polite');
    location.insertBefore(errorHtml, location.firstChild);
};

const prependErrorMessage = (message, location) => {
    const errorClass = classes.formError.replace('.', '');
    prependMessage(message, location, errorClass);
};

const prependSuccessMessage = (message, location) => {
    const errorClass = classes.formSuccess.replace('.', '');
    prependMessage(message, location, errorClass);
};

export { prependErrorMessage, prependSuccessMessage };
