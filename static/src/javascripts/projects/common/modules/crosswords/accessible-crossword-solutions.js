export const initAccessibleCrosswordSolutionsDisclosure = () => {
        var disclosureComponent = document.querySelector('[data-component="crossword-solutions-disclosure"]');
        var trigger = disclosureComponent.querySelector('[data-component="crossword-solutions-disclosure-trigger"]');
        var panel = disclosureComponent.querySelector('[data-component="crossword-solutions-disclosure-panel"]');
        var label = trigger.querySelector('[data-component="crossword-solutions-disclosure-trigger-label"]');


        trigger.addEventListener('click', function() {
            var wasAlreadyExpanded = trigger.getAttribute('aria-expanded') === 'true';
            trigger.setAttribute('aria-expanded', !wasAlreadyExpanded);
            label.textContent = wasAlreadyExpanded ? 'Reveal solutions' : 'Hide solutions'
            panel.hidden = wasAlreadyExpanded;
        });
}
