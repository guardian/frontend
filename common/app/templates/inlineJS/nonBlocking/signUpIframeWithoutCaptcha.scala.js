@()

function validateAndTrack(event) {
    event.preventDefault();
    const formIsValid = validateForm();

    if (formIsValid) {
        sendTrackingUsingButton()
        const formElement = document.querySelector('form');
        formElement.submit()
    }
}

function trackFormSubmit(formElement) {
    formElement.addEventListener('submit', validateAndTrack)
}


trackFormSubmit(document.querySelector('form'))
