
import { getSync as geolocationGetSync } from "lib/geolocation";
import config from "lib/config";
import { setupEpicInLiveblog } from "common/modules/commercial/contributions-liveblog-utilities";
import { isCompatibleWithLiveBlogEpic, liveBlogTemplate, makeEpicABTest, buildEpicCopy } from "common/modules/commercial/contributions-utilities";

const geolocation = geolocationGetSync();

const copyGlobal: AcquisitionsEpicTemplateCopy = {
  paragraphs: ['In these extraordinary times, the Guardian’s editorial independence has never been more important. Because no one sets our agenda, or edits our editor, we can keep delivering quality, trustworthy, fact-checked journalism each and every day. Free from commercial or political influence, we can report fearlessly on world events and challenge those in power.', 'Your support protects the Guardian’s independence. We believe every one of us deserves equal access to accurate news and calm explanation. No matter how unpredictable the future feels, we will remain with you, delivering high quality news so we can all make critical decisions about our lives, health and security – based on fact, not fiction.', 'Support the Guardian from as little as %%CURRENCY_SYMBOL%%1 – and it only takes a minute. Thank you.']
};

const copyUS: AcquisitionsEpicTemplateCopy = {
  paragraphs: ['<b>Since you’re here ...</b>', '... we have a small favour to ask. Millions are flocking to the Guardian for independent, quality news every day. As we prepare for what promises to be a pivotal year for America, we’re asking you to consider a year-end gift to help fund our journalism.', 'We believe everyone deserves access to information that’s grounded in science and truth. That’s why we made a different choice: to keep our reporting open for all readers, regardless of where they live or what they can afford to pay.', 'We’re asking readers to help us raise $1.25m to support our reporting in the new year. If you’ve enjoyed our live updates and in-depth coverage, support the Guardian from as little as %%CURRENCY_SYMBOL%%1 – and it only takes a minute. Thank you.']
};

const copy = geolocation === 'US' ? copyUS : copyGlobal;

export const liveblogEpicDesignTest: EpicABTest = makeEpicABTest({
  id: 'LiveblogEpicDesignTestR2',
  campaignId: 'liveblog-epic-design-test-r2',

  geolocation,
  highPriority: false,

  start: '2020-10-15',
  expiry: '2021-01-27',

  author: 'TF',
  description: 'Test designs for the liveblog epic',
  successMeasure: 'Conversion rate',
  idealOutcome: 'Acquires many Supporters',

  audienceCriteria: 'All',
  audience: 1,
  audienceOffset: 0,
  canRun: () => config.get('page').contentType === 'LiveBlog',
  pageCheck: isCompatibleWithLiveBlogEpic,
  deploymentRules: 'AlwaysAsk',

  variants: [{
    id: 'control',
    products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
    test: setupEpicInLiveblog,
    template: liveBlogTemplate('liveblog-epic-test__control'),
    copy: buildEpicCopy(copy, false, geolocation)
  }, {
    id: 'v1',
    products: ['CONTRIBUTION', 'MEMBERSHIP_SUPPORTER'],
    test: setupEpicInLiveblog,
    template: liveBlogTemplate('liveblog-epic-test__v1'),
    copy: buildEpicCopy(copy, false, geolocation)
  }]
});