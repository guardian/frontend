import { breakpoints } from '@guardian/source-foundations'

const breakpointsToTest: Array<keyof typeof breakpoints> = ['mobile', 'tablet', 'desktop', 'wide']
const breakpointWidths = breakpointsToTest.map(b => breakpoints[b])

export { breakpointWidths as breakpoints }
