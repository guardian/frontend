// @flow
import { appendToLastElement } from 'lib/array-utils';

export const epicLiveBlogTemplate = (params: {
    copy: AcquisitionsEpicTemplateCopy,
    componentName: string,
    supportURL: string
}) =>
    `<div class="block block--content is-epic" data-component="${
        params.componentName
    }">
        <p class="block-time published-time">
            <a href="#" itemprop="url" class="block-time__link">
                <time data-relativeformat="med" itemprop="datePublished" class="js-timestamp"></time>
                <span class="block-time__absolute"></span>
            </a>
        </p>
        <div class="block-elements block-elements--no-byline">
            ${appendToLastElement(
                params.copy.paragraphs,
                ` <span class="contributions__highlight">${params.copy.highlightedText}</span> <a href="${params.supportURL}" target="_blank" class="u-underline">Make a contribution</a> - Guardian HQ`
            ).map(paragraph =>
                `<p><em>${paragraph}</em></p>`
            ).join('')}        
        </div>
    </div>`;
