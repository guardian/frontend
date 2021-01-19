import $ from 'lib/$';
import { mountDynamic } from "@guardian/automat-modules";

// TODO - remove support for this?
const INSERT_EPIC_AFTER_CLASS = 'js-insert-epic-after';

const getBlocksToInsertEpicAfter = () => {
    const blocks = document.getElementsByClassName('block');
    const blocksToInsertManualEpicAfter = document.getElementsByClassName(
        INSERT_EPIC_AFTER_CLASS
    );
    const epicsAlreadyOnPage = document.getElementsByClassName('is-epic');

    const isLiveblogLongEnoughYet = blocks.length > 4;

    if (
        blocksToInsertManualEpicAfter.length ||
        epicsAlreadyOnPage.length ||
        !isLiveblogLongEnoughYet
    ) {
        return Array.from(blocksToInsertManualEpicAfter);
    }

    const autoBlockNum = Math.floor(Math.random() * 3);
    const blockToInsertAutoEpicAfter = blocks[autoBlockNum];

    return Array.from(blocksToInsertManualEpicAfter).concat(
        blockToInsertAutoEpicAfter
    );
};

export const setupRemoteEpicInLiveblog = (
    Component,
    props,
) => {
    const blocks = getBlocksToInsertEpicAfter();
    // Only insert 1 epic. The existing code will be cleaned up in a follow-up PR
    if (blocks[0]) {
        const epic = $.create('<div class="block"/>');
        epic.insertAfter(blocks[0]);
        mountDynamic(epic[0], Component, props, true);

        return epic[0];
    }
};
