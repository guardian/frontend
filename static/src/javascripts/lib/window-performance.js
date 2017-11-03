// @flow

const api =
    window.performance ||
    window.msPerformance ||
    window.webkitPerformance ||
    window.mozPerformance;

export default api;
