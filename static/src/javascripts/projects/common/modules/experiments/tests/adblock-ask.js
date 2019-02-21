// @flow
//import askHtml from 'raw-loader!journalism/views/podcastContainerA.html';

const askHtml = `
<div class="contributions__adblock--moment">
    <div class="contributions__adblock--moment-header">
        <h2 class="contributions__adblock--moment-header--blue">Support</h2>
        <h2 class="contributions__adblock--moment-header--blue">The Guardian's</h2>
        <h2 class="contributions__adblock--moment-header--orange">model for open, independent journalism</h2>
    </div>
    <div class="contributions__adblock--moment-sub">
        We're available for everyone, supported by our readers
    </div>
    <div class="contributions__adblock--moment-button">
        <a class="contributions__option-button contributions__contribute contributions__contribute--epic contributions__contribute--epic-member"
          href="https://support.theguardian.com/contribute"
          target="_blank">
          Support The Guardian
        </a>
    </div>
</div>
`;

export const adblockTest: ABTest = {
    id: 'AdblockAsk',
    start: '2019-02-20',
    expiry: '2020-02-20',
    author: 'Tom Forbes',
    description: 'Add a contributions message under adverts, for users with adblocker enabled',
    audience: 1,
    audienceOffset: 0,
    successMeasure: '???',
    audienceCriteria: '',
    showForSensitive: true,
    canRun() {
        console.log("RUNNING")
        return true;
    },

    variants: [
        {
            id: "control",
            test: (): void => {
                console.log("test?")
                const slot = document.querySelector('.aside-slot-container');
                console.log("slot", slot)
                if (slot) {
                    console.log("found slot")
                    // slot.innerHTML = askHtml;
                    slot.insertAdjacentHTML('afterend', askHtml)
                }
            }
        }
    ]
};
