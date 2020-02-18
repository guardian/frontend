// @flow
import {
    hasUserDismissedGate,
    isNPageOrHigherPageView,
    isLoggedIn,
    isInvalidArticleType,
    isInvalidSection,
} from './helper';

// can show method for banners, can control how this functions for different variants using the switch block
export const canShow: ({
    componentName: string,
    component: OphanComponent,
    variant: string,
}) => boolean = ({ componentName, component, variant }) => {
    if (!componentName || !component || !component.id || !variant) return false;

    switch (variant) {
        case 'variant':
        case 'control':
            return (
                !hasUserDismissedGate({
                    componentName,
                    componentId: component.id,
                    variant,
                }) &&
                isNPageOrHigherPageView(2) &&
                !isLoggedIn() &&
                !isInvalidArticleType() &&
                !isInvalidSection()
            );
        default:
            return false;
    }
};
