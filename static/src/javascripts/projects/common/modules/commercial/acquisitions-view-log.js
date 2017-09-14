// @flow
import { local } from 'lib/storage';

const viewKey = 'gu.contributions.views';
const viewLog = local.get(viewKey) || [];

const maxLogEntries = 50;

/**
 * Log that the user has seen an Epic test so we can limit how many times they see it.
 * The number of entries is limited to the number in maxLogEntries.
 *
 * @param testId
 */
const logView = (testId: string): void => {
    viewLog.push({
        date: new Date().getTime(),
        testId,
    });

    local.set(viewKey, viewLog.slice(-maxLogEntries));
};

const viewsInPreviousDays = (days: number, testId: ?string): number => {
    const ms = days * 1000 * 60 * 60 * 24;
    const now = new Date().getTime();

    return viewLog.filter(
        view => (testId ? view.testId === testId : true) && view.date > now - ms
    ).length;
};

const isViewable = (v: Variant, t: ABTest): boolean => {
    // if the variant is unlimited or doesn't specify
    // any maxViews parameters, treat it as viewable
    if (
        (v.options && v.options.isUnlimited) ||
        (!v.options || !v.options.maxViews)
    )
        return true;

    const {
        count: maxViewCount,
        days: maxViewDays,
        minDaysBetweenViews: minViewDays,
    } = v.options.maxViews;

    const testId = t.useLocalViewLog ? t.id : undefined;

    const withinViewLimit =
        viewsInPreviousDays(maxViewDays, testId) < maxViewCount;
    const enoughDaysBetweenViews =
        viewsInPreviousDays(minViewDays, testId) === 0;

    return withinViewLimit && enoughDaysBetweenViews;
};

const clear = () => {
    local.set(viewKey, []);
};

export { logView, viewsInPreviousDays, isViewable, clear };
