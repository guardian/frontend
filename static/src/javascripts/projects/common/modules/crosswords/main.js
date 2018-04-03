// @flow

import React from 'react';
import { render } from 'react-dom';
import bean from 'bean';
import fastdom from 'lib/fastdom-promise';
import $ from 'lib/$';
import Crossword from 'common/modules/crosswords/crossword';

const initCrosswords = (): void => {
    fastdom
        .read(() => document.getElementsByClassName('js-crossword'))
        .then(elements => {
            [...elements].forEach(element => {
                const data = element.getAttribute('data-crossword-data');

                if (!data) {
                    throw new Error(
                        'JavaScript crossword without associated data in data-crossword-data'
                    );
                }

                const crosswordComponent = render(
                    <Crossword data={JSON.parse(data)} />,
                    element
                );

                const entryId = window.location.hash.replace('#', '');
                const entry = crosswordComponent.props.data.entries.find(
                    val => val.id === entryId
                );

                if (entry) {
                    crosswordComponent.focusFirstCellInClue(entry);
                }

                bean.on(element, 'click', $('.crossword__clue'), e => {
                    e.preventDefault();

                    const idMatch = e.currentTarget.hash.match(/#.*/);
                    const newEntryId = idMatch && idMatch[0].replace('#', '');
                    const newEntry = crosswordComponent.props.data.entries.find(
                        val => val.id === newEntryId
                    );
                    const focussedEntry = crosswordComponent.clueInFocus();
                    const isNewEntry =
                        focussedEntry && focussedEntry.id !== newEntry.id;

                    // Only focus the first cell in the new clue if it's not already
                    // focussed. When focussing a cell in a new clue, we update the
                    // hash fragment afterwards, in which case we do not want to
                    // reset focus to the first cell.
                    if (newEntry && (focussedEntry ? isNewEntry : true)) {
                        crosswordComponent.focusFirstCellInClue(newEntry);
                    }
                });
            });
        });
};

export { initCrosswords };
