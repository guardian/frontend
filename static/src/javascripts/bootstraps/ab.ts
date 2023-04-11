import type { ABTest } from '@guardian/ab-core';
import { concurrentTests } from 'common/modules/experiments/ab-tests';

const clientSideABTests = concurrentTests.reduce<
	Record<string, ABTest | undefined>
>((abTests, test) => ({ ...abTests, [test.id]: test }), {});

window.guardian.config.clientSideABTests = clientSideABTests;
