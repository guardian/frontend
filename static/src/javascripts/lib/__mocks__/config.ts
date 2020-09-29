

export default {
  get(path: string, defaultValue: any): any {
    const value = path.split('.').reduce((acc: Object, prop: string): any => {
      if (acc[prop]) {
        return acc[prop];
      }

      return defaultValue;
    }, this);

    if (typeof value !== 'undefined') {
      return value;
    }

    return defaultValue;
  }
};