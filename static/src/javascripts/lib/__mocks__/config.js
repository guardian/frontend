// @flow

export default {
    get(path: string, defaultValue: any): any {
        return path.split('.').reduce((acc: Object, prop: string): any => {
            if (acc[prop]) {
                return acc[prop]
            }

            return defaultValue;
        }, this);
    }
};
