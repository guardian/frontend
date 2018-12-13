// @flow

type pagePropertiesRelevantToEpic = {|
    section?: string,
    toneIds?: string[],
    keywordIds?: string[],
|};

// Data has shown that pages with these properties generate significantly
// less money than others, so we don't want to waste an epic impression on them.
// Especially since that epic impression deprives us of Outbrain money.
const pagePropertiesWhichExcludeEpic: pagePropertiesRelevantToEpic[] = [
    // e.g. https://www.theguardian.com/football/blog/2018/dec/12/spurs-fans-wallow-in-afterglow-un-spursy-ending
    { section: 'football', toneIds: ['tone/features'] },

    // e.g. https://www.theguardian.com/football/2018/dec/12/valencia-manchester-united-champions-league-match-report
    { section: 'football', toneIds: ['tone/matchreports'] },

    // e.g. https://www.theguardian.com/money/2018/dec/13/slime-toys-tested-fail-meet-eu-safety-standards-hamleys-christmas
    { section: 'money' },

    // e.g. https://www.theguardian.com/education/2018/dec/12/female-scholars-are-marginalised-on-wikipedia-because-its-written-by-men
    { section: 'education' },

    // e.g. https://www.theguardian.com/games/2018/dec/13/cat-condo-is-the-stupidest-most-cynical-game-in-the-app-store-so-why-cant-i-stop-playing
    { section: 'games' },

    // e.g. https://www.theguardian.com/teacher-network/2018/jun/02/secret-teacher-teaching-children-without-play-soul-destroying-sats-assessment
    { section: 'teacher-network' },

    // e.g. https://www.theguardian.com/careers/2018/dec/06/dont-expect-a-survivor-to-tell-you-her-experience-of-undergoing-fgm
    { section: 'careers' },

    // e.g. https://www.theguardian.com/guardian-masterclasses/2018/oct/25/get-healthy-and-live-your-best-life-with-dr-rangan-chatterjee-health-wellness-course
    { keywordIds: ['guardian-masterclasses/guardian-masterclasses'] },
];

export const isArticleWorthAnEpicImpression = (page: Object) =>
    !pagePropertiesWhichExcludeEpic.some(propertiesToExclude => {
        const sectionsMatch = propertiesToExclude.section
            ? propertiesToExclude.section === page.section
            : true;
        const toneIdsMatch = propertiesToExclude.toneIds
            ? propertiesToExclude.toneIds.every(toneId =>
                  page.toneIds.includes(toneId)
              )
            : true;
        const keywordIdsMatch = propertiesToExclude.keywordIds
            ? propertiesToExclude.keywordIds.every(keywordId =>
                  page.keywordIds.includes(keywordId)
              )
            : true;
        return sectionsMatch && toneIdsMatch && keywordIdsMatch;
    });
