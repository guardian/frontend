// @flow
export const epicLiveBlogTemplate = (params: {
    copy: AcquisitionsEpicTemplateCopy,
    componentName: string,
}) =>
    `<div class="block block--content is-epic" data-component="${params.componentName}">
        <p class="block-time published-time">
            <a href="#" itemprop="url" class="block-time__link">
                <time data-relativeformat="med" itemprop="datePublished" class="js-timestamp"></time>
                <span class="block-time__absolute"></span>
            </a>
        </p>
        <div class="block-elements block-elements--no-byline">
            <p>
                <em>
                    ${params.copy.p1}
                </em>
            </p>
            <p>
                <em>
                    ${params.copy.p2}
                </em>
            </p>
        </div>
    </div>`;
