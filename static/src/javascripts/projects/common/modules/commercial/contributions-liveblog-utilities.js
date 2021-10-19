import { mountDynamic } from '@guardian/automat-modules';
import $ from '../../../../lib/$';

const getBlockToInsertEpicAfter = () => {
	const blocks = document.getElementsByClassName('block');
	const epicsAlreadyOnPage = document.getElementsByClassName('is-epic');

	const isLiveblogLongEnoughYet = blocks.length > 4;

	if (epicsAlreadyOnPage.length < 1 && isLiveblogLongEnoughYet) {
		const autoBlockNum = Math.floor(Math.random() * 3);
		return blocks[autoBlockNum];
	}
};

export const setupRemoteEpicInLiveblog = (Component, props) => {
	const block = getBlockToInsertEpicAfter();
	// Only insert 1 epic. The existing code will be cleaned up in a follow-up PR
	if (block) {
		const epic = $.create('<div class="block"/>');
		epic.insertAfter(block);
		mountDynamic(epic[0], Component, props, true);

		return epic[0];
	}
};
