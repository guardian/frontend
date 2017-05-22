export default breakpointNameToAttribute;

function breakpointNameToAttribute(breakpointName) {
    return breakpointName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
