// @flow
export const template = ({
    widgetType,
}: {
    widgetType: string,
}) => ` <div class="fc-container fc-container--${widgetType} hide-on-childrens-books-site js-${widgetType}">
    <div class="fc-container__inner js-${widgetType}-container"></div>
</div>`;
