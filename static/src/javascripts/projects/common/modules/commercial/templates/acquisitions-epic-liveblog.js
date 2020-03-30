// @flow

export type LiveblogEpicLastSentenceTemplate = (
    highlightedText?: string,
    supportURL: string
) => string;

const lastSentenceTemplateControl: LiveblogEpicLastSentenceTemplate = (
    highlightedText?: string,
    supportURL: string
) =>
    `${
        highlightedText
            ? `<span className="contributions__highlight">${highlightedText}</span>`
            : ''
    }
    <a href="${supportURL}" target="_blank" class="u-underline">Make a contribution</a> - The Guardian`;

const lastSentenceTemplateButtonNoArrow: LiveblogEpicLastSentenceTemplate = (
    highlightedText?: string,
    supportURL: string
) =>
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

const lastSentenceTemplateButtonArrow: LiveblogEpicLastSentenceTemplate = (
    highlightedText?: string,
    supportURL: string
) =>
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
          <svg
            class="svg-arrow-right-straight"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 17.89"
            preserveAspectRatio="xMinYMid"
            aria-hidden="true"
            focusable="false"
            >
                <path d="M20 9.35l-9.08 8.54-.86-.81 6.54-7.31H0V8.12h16.6L10.06.81l.86-.81L20 8.51v.84z" />
            </svg>
        </a>
    </div>`;

const epicLiveBlogTemplate = ({
    copy,
    componentName,
    supportURL,
    lastSentenceTemplate = lastSentenceTemplateControl,
}: {
    copy: AcquisitionsEpicTemplateCopy,
    componentName: string,
    supportURL: string,
    lastSentenceTemplate: LiveblogEpicLastSentenceTemplate,
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

export {
    lastSentenceTemplateControl,
    lastSentenceTemplateButtonNoArrow,
    lastSentenceTemplateButtonArrow,
    epicLiveBlogTemplate,
};
