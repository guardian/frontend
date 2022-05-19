@()

function trackFormSubmit(formElement) {
    if (!formElement) {return}
    formElement.addEventListener('submit', sendTrackingForFormSubmission)
}

trackFormSubmit(document.querySelector('form'))
