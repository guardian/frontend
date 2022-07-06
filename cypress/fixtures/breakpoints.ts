import { breakpoints } from '@guardian/source-foundations'

const breakpointsToTest = ['mobile', 'tablet', 'desktop', 'wide']
const breakpointsWidths = Object.fromEntries(
	Object.entries(breakpoints).filter(
		([key, _]) => breakpointsToTest.includes(key)
	)
 );

export { breakpointsWidths as breakpoints }
