// @flow

export type LiveblogEpicLastSentenceTemplate = (
    highlightedText?: string,
    supportURL: string
) => string;

const lastSentenceTemplateGenerator = (hasSubscribeLink: boolean): LiveblogEpicLastSentenceTemplate => (
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
        ${
            hasSubscribeLink
               ? `<a class="component-button--liveblog-subscribe" href="https://support.theguardian.com/subscribe">Subscribe</a>`
               : ''
        }
    </div>`;


const lastSentenceTemplateControl: LiveblogEpicLastSentenceTemplate = lastSentenceTemplateGenerator(false);

const lastSentenceTemplateButtonAndSubscribe: LiveblogEpicLastSentenceTemplate = lastSentenceTemplateGenerator(true);

const epicLiveBlogTemplate = ({
    copy,
    componentName,
    supportURL,
    lastSentenceTemplate,
}: {
    copy: AcquisitionsEpicTemplateCopy,
    componentName: string,
    supportURL: string,
    lastSentenceTemplate?: LiveblogEpicLastSentenceTemplate,
}) => {
    const lastSentence = lastSentenceTemplate || lastSentenceTemplateControl;

    return `<div class="block block--content is-epic" data-component="${componentName}">
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
            <p><em>${lastSentence(copy.highlightedText, supportURL)}</em></p>
        </div>
    </div>`;
};

export {
    lastSentenceTemplateControl,
    lastSentenceTemplateButtonAndSubscribe,
    epicLiveBlogTemplate,
};
