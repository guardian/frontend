import $ from 'jquery';

export default function (element) {
    return $(element).text().trim().replace(/\s+/g, ' ');
}
