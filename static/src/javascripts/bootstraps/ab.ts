import type { ABTest } from '@guardian/ab-core';
import { log } from '@guardian/libs';
import { concurrentTests } from 'common/modules/experiments/ab-tests';

log('dotcom', 'Setting AB test stub');

const clientSideExperiments = concurrentTests.reduce<
	Record<string, ABTest | undefined>
>((abTests, test) => ({ ...abTests, [test.id]: test }), {});

window.guardian.config.clientSideExperiments = clientSideExperiments;
