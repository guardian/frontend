// @flow
const lastSentenceTemplate = (highlightedText?: string, supportURL: string) =>
    `${
        highlightedText
            ? `<span className="contributions__highlight">${highlightedText}</span>`
            : ''
    }
    <div class="component-button--liveblog-container">
        <a class="component-button component-button--liveblog component-button--hasicon-right contributions__contribute--epic-member"
          href=${supportURL}
          target="_blank">
          Make a contribution
        </a>
    </div>`;

export const epicLiveBlogTemplate = ({
                                         copy,
                                         componentName,
                                         supportURL,
                                     }: {
    copy: AcquisitionsEpicTemplateCopy,
    componentName: string,
    supportURL: string,
}) =>
    `<div class="block block--content is-epic" data-component="${componentName}">
        <p class="block-time published-time">
            <a href="#" itemprop="url" class="block-time__link">
                <time data-relativeformat="med" itemprop="datePublished" class="js-timestamp"></time>
                <span class="block-time__absolute"></span>
            </a>
        </p>
        <div class="block-elements block-elements--no-byline">
            ${copy.paragraphs
        .map(paragraph => `<p><em>${paragraph}</em></p>`)
        .join('')}
            <p><em>${lastSentenceTemplate(
        copy.highlightedText,
        supportURL
    )}</em></p>
        </div>
    </div>`;
