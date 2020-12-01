import quoteSvg from 'svgs/icon/garnett-quote.svg';

export const acquisitionsTestimonialBlockTemplate = (
    params: AcquisitionsEpicTestimonialCopy
) => `<div class="epic__testimonial-container">
        <div class="epic__testimonial-quote">
            ${quoteSvg.markup}
        </div>
        <blockquote class="epic__testimonial-text">
            ${params.text}
            <cite class="epic__testimonial-name">
                ${params.name}
            </cite>
        </blockquote>
    </div>`;
