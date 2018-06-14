// @flow
import quoteSvg from 'svgs/icon/garnett-quote.svg';

export const acquisitionsTestimonialBlockTemplate = (
    params: AcquisitionsEpicTestimonialCopy
) =>
    `<div class="epic__testimonial-container epic__testimonial-container--subtle">
        <div class="epic__testimonial-quote epic__testimonial-quote--subtle">
            ${quoteSvg.markup}
        </div>
        <blockquote class="epic__testimonial-text">
            ${params.text}
            <cite class="epic__testimonial-name">
                ${params.name}
            </cite>
        </blockquote>
    </div>`;
