const ctaTemplate = (
    supportURL: string,
    ctaText?: string
) => `<div class="component-button--liveblog-container">
        <a class="component-button component-button--liveblog component-button--hasicon-right contributions__contribute--epic-member"
          href=${supportURL}
          target="_blank">
          ${ctaText || 'Show your support'}
        </a>
    </div>`;

export const epicLiveBlogTemplate = ({
    copy,
    componentName,
    supportURL,
    ctaText,
    cssClass,
}: {
    copy: AcquisitionsEpicTemplateCopy;
    componentName: string;
    supportURL: string;
    ctaText?: string;
    cssClass?: string;
}) => `<div class="block block--content is-epic ${
    cssClass || ''
}" data-component="${componentName}">
        <p class="block-time published-time">
            <a href="#" itemprop="url" class="block-time__link">
                <time data-relativeformat="med" itemprop="datePublished" class="js-timestamp"></time>
                <span class="block-time__absolute"></span>
            </a>
        </p>
        <div class="block-elements block-elements--no-byline">
            ${copy.paragraphs
                .map((paragraph) => `<p>${paragraph}</p>`)
                .join('')}
            <p>${ctaTemplate(supportURL, ctaText)}</p>
        </div>
    </div>`;
