@()

function trackFormSubmit(formElement) {
    if (!formElement) {return}
    formElement.addEventListener('submit', sendTrackingForFormSubmission);
}

trackClickEvent(document.querySelector('button[type=submit]'));
trackFormSubmit(document.querySelector('form'))
