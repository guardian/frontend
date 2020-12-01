const classes = {
    formError: '.form__error',
    formSuccess: '.form__success',
};

const prependMessage = (
    message: string,
    location: Element,
    clazz: string
): void => {
    const errorHtml = document.createElement('div');
    errorHtml.innerHTML = message;
    errorHtml.className = clazz;
    errorHtml.setAttribute('role', 'alert');
    errorHtml.setAttribute('aria-live', 'polite');
    location.insertBefore(errorHtml, location.firstChild);
};

const prependErrorMessage = (message: string, location: Element): void => {
    const errorClass = classes.formError.replace('.', '');
    prependMessage(message, location, errorClass);
};

const prependSuccessMessage = (message: string, location: Element): void => {
    const errorClass = classes.formSuccess.replace('.', '');
    prependMessage(message, location, errorClass);
};

export { prependErrorMessage, prependSuccessMessage };
