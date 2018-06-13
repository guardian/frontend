// @flow
import type { AcquisitionsEpicTestimonialTemplateParameters } from 'common/modules/commercial/acquisitions-epic-testimonial-parameters';
import quoteSvg from 'svgs/icon/garnett-quote.svg';

export const acquisitionsTestimonialBlockTemplate = (
    params: AcquisitionsEpicTestimonialTemplateParameters
) =>
    `<div class="epic__testimonial-container epic__testimonial-container--subtle">
        <div class="epic__testimonial-quote epic__testimonial-quote--subtle">
            ${quoteSvg.markup}
        </div>
        <blockquote class="epic__testimonial-text">
            ${params.testimonialMessage}
            <cite class="epic__testimonial-name">
                ${params.testimonialName}
            </cite>
        </blockquote>
    </div>`;
