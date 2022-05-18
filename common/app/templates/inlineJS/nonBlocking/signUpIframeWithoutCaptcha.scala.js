@()

function validateAndTrack(event) {
    event.preventDefault();
    const formIsValid = validateForm();

    if (formIsValid) {
        sendTrackingForFormSubmission()
        document.querySelector('form').submit()
    }
}

function trackFormSubmit(formElement) {
    if (!formElement) {return}
    formElement.addEventListener('submit', validateAndTrack)
}

trackFormSubmit(document.querySelector('form'))
