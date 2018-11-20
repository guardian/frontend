// @flow
import { appendToLastElement } from 'lib/array-utils';

const gridImage = `
    <div class="u-responsive-ratio" style="padding-bottom: 60.01%;">
        <picture>
            <!--[if IE 9]><video style="display: none;"><![endif]-->
                <source media="(min-width: 980px) and (-webkit-min-device-pixel-ratio: 1.25), (min-width: 980px) and (min-resolution: 120dpi)" sizes="620px" srcset="https://i.guim.co.uk/img/media/6e0008cc2409cad06f119d58986a2a48455a4c7b/0_55_4256_2554/master/4256.jpg?width=620&amp;quality=45&amp;auto=format&amp;fit=max&amp;dpr=2&amp;s=faac59182b5611161150ad0b3bddd802 1240w">
                <source media="(min-width: 980px)" sizes="620px" srcset="https://i.guim.co.uk/img/media/6e0008cc2409cad06f119d58986a2a48455a4c7b/0_55_4256_2554/master/4256.jpg?width=620&amp;quality=85&amp;auto=format&amp;fit=max&amp;s=d35b7eb37a1b82c6c5b96c19c6c1e213 620w">
                <source media="(min-width: 740px) and (-webkit-min-device-pixel-ratio: 1.25), (min-width: 740px) and (min-resolution: 120dpi)" sizes="700px" srcset="https://i.guim.co.uk/img/media/6e0008cc2409cad06f119d58986a2a48455a4c7b/0_55_4256_2554/master/4256.jpg?width=700&amp;quality=45&amp;auto=format&amp;fit=max&amp;dpr=2&amp;s=0521a812c54ad71f1ffb42f6f5edc81c 1400w">
                <source media="(min-width: 740px)" sizes="700px" srcset="https://i.guim.co.uk/img/media/6e0008cc2409cad06f119d58986a2a48455a4c7b/0_55_4256_2554/master/4256.jpg?width=700&amp;quality=85&amp;auto=format&amp;fit=max&amp;s=d27b7f121de54e6253a601ee742fc559 700w">
                <source media="(min-width: 660px) and (-webkit-min-device-pixel-ratio: 1.25), (min-width: 660px) and (min-resolution: 120dpi)" sizes="620px" srcset="https://i.guim.co.uk/img/media/6e0008cc2409cad06f119d58986a2a48455a4c7b/0_55_4256_2554/master/4256.jpg?width=620&amp;quality=45&amp;auto=format&amp;fit=max&amp;dpr=2&amp;s=faac59182b5611161150ad0b3bddd802 1240w">
                <source media="(min-width: 660px)" sizes="620px" srcset="https://i.guim.co.uk/img/media/6e0008cc2409cad06f119d58986a2a48455a4c7b/0_55_4256_2554/master/4256.jpg?width=620&amp;quality=85&amp;auto=format&amp;fit=max&amp;s=d35b7eb37a1b82c6c5b96c19c6c1e213 620w">
                <source media="(min-width: 480px) and (-webkit-min-device-pixel-ratio: 1.25), (min-width: 480px) and (min-resolution: 120dpi)" sizes="645px" srcset="https://i.guim.co.uk/img/media/6e0008cc2409cad06f119d58986a2a48455a4c7b/0_55_4256_2554/master/4256.jpg?width=645&amp;quality=45&amp;auto=format&amp;fit=max&amp;dpr=2&amp;s=c77e451daf60249a5767ba47556f4644 1290w">
                <source media="(min-width: 480px)" sizes="645px" srcset="https://i.guim.co.uk/img/media/6e0008cc2409cad06f119d58986a2a48455a4c7b/0_55_4256_2554/master/4256.jpg?width=645&amp;quality=85&amp;auto=format&amp;fit=max&amp;s=028b3e772dc962a71c9925acaf06d69d 645w">
                <source media="(min-width: 0px) and (-webkit-min-device-pixel-ratio: 1.25), (min-width: 0px) and (min-resolution: 120dpi)" sizes="465px" srcset="https://i.guim.co.uk/img/media/6e0008cc2409cad06f119d58986a2a48455a4c7b/0_55_4256_2554/master/4256.jpg?width=465&amp;quality=45&amp;auto=format&amp;fit=max&amp;dpr=2&amp;s=5af08f110771f0a8e06c3a3b02471be2 930w">
                <source media="(min-width: 0px)" sizes="465px" srcset="https://i.guim.co.uk/img/media/6e0008cc2409cad06f119d58986a2a48455a4c7b/0_55_4256_2554/master/4256.jpg?width=465&amp;quality=85&amp;auto=format&amp;fit=max&amp;s=bea4aa9f01bb3599b7a1c02153257b9b 465w">
            <!--[if IE 9]></video><![endif]-->
            <img class="maxed responsive-img" itemprop="contentUrl" alt="Fire raged through the town of Paradise in Butte county. ‘We don’t have anything left,’ said a local father." src="https://i.guim.co.uk/img/media/6e0008cc2409cad06f119d58986a2a48455a4c7b/0_55_4256_2554/master/4256.jpg?width=300&amp;quality=85&amp;auto=format&amp;fit=max&amp;s=590f7c7c1187d0e592e95cdcf43fd243">
        </picture>
    </div>
`;

export const acquisitionsEpicUsLeadingWithClimateTemplate = ({
    copy: { paragraphs, highlightedText },
    componentName,
    buttonTemplate,
}: {
    copy: AcquisitionsEpicTemplateCopy,
    componentName: string,
    buttonTemplate: string,
}) =>
    `<div class="contributions__epic contributions__epic--us-leading-with-climate" data-component="${componentName}" data-link-name="epic">
        <div>
            <div>
                <h2 class="contributions__title contributions__title--us-leading-with-climate">
                    This is a photo of America’s future &hellip;
                </h2>
                ${gridImage}
                <h2 class="contributions__title contributions__title--us-leading-with-climate">
                    &hellip; if we can’t keep the focus on the climate crisis.
                </h2>                
                ${appendToLastElement(
                    paragraphs,
                    ` <strong><span class="contributions__highlight">${highlightedText}</span></strong>`
                )
                    .map(paragraph => `<p>${paragraph}</p>`)
                    .join('')}
            </div>
    
            ${buttonTemplate}
        </div>
    </div>`;
