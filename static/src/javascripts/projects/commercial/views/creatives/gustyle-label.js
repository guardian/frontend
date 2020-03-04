// @flow

type Props = {
    data: {
        dataAttr: string,
        buttonTitle: string,
        icon: string,
        dataAttr: string,
        infoTitle: string,
        infoText: string,
        infoLinkUrl: string,
        infoLinkText: string,
    },
};

export const template = ({ data }: Props) =>
    `<div class="gu-comlabel has-popup">
	<button class="u-button-reset gu-comlabel__btn popup__toggle" data-toggle="gu-compopup--${
        data.dataAttr
    }">${data.buttonTitle} ${data.icon}</button>
	<div class="popup popup--default is-off gu-compopup gu-compopup--${
        data.dataAttr
    } gu-stylebox">
		<h3 class="gu-compopup__title">${data.infoTitle}</h3>
		<p class="gu-compopup__text">${data.infoText}</p>
		<a class="gu-compopup__link" href="${data.infoLinkUrl}" target="_blank">${
        data.infoLinkText
    }</a>
	</div>
</div>`;
