// @flow

export default {
    get(path: string, defaultValue: any): any {
        return path.split('.').reduce((acc, prop) => {
            if (acc[prop]) {
                return acc[prop]
            }

            return defaultValue;
        }, this);
    }
};
