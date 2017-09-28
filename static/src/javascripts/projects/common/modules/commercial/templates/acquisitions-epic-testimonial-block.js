// @flow
import type { AcquisitionsEpicTestimonialTemplateParameters } from 'common/modules/commercial/acquisitions-epic-testimonial-parameters';

const acquisitionsTestimonialBlockTemplate = (params: AcquisitionsEpicTestimonialTemplateParameters) => `<div class="epic__testimonial-container epic__testimonial-container--subtle">
    <div class="epic__testimonial-quote epic__testimonial-quote--subtle">
        ${params.quoteSvg}
    </div>
    <blockquote class="epic__testimonial-text">
        ${params.testimonialMessage}
        <cite class="epic__testimonial-name">
            ${params.testimonialName}
        </cite>
    </blockquote>
</div>`

export default acquisitionsTestimonialBlockTemplate
