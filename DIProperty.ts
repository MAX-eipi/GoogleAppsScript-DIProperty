class DIProperty {
    private static readonly _factories: Record<string, Record<string, () => unknown>> = {};
    private static readonly _container: Record<string, Record<string, unknown>> = {};

    private static toInternalKey(key: string | Function): string {
        return key instanceof Function ? key.name : key;
    }

    private static getFactories(groupKey: string): Record<string, () => unknown> {
        if (!(groupKey in this._factories)) {
            this._factories[groupKey] = {};
        }
        return this._factories[groupKey];
    }

    private static getContainer(groupKey: string): Record<string, unknown> {
        if (!(groupKey in this._container)) {
            this._container[groupKey] = {};
        }
        return this._container[groupKey];
    }

    public static bind<T>(key: string | Function | { new(): T }, factory: () => T, groupKey = 'global'): void {
        this.getFactories(groupKey)[this.toInternalKey(key)] = factory;
    }

    public static register<T>(key: string | Function | { new(): T }, instance: T, groupKey = 'global'): void {
        this.getContainer(groupKey)[this.toInternalKey(key)] = instance;
    }

    public static resolve<T>(key: string | Function | { new(): T }, groupKey = 'global'): T {
        const internalKey = this.toInternalKey(key);
        const container = this.getContainer(groupKey);
        if (!(internalKey in container)) {
            container[internalKey] = this.getFactories(groupKey)[internalKey]();
        }
        return container[internalKey] as T;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public static inject(target: string | Function, groupKey = 'global'): any {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return function (_target: unknown, propertyKey: string): PropertyDescriptor {
            return {
                configurable: false,
                enumerable: false,
                get: () => {
                    return self.resolve(target, groupKey);
                }
            }
        }
    }

    public static createKey(...keys: (string | Function)[]): string {
        let ret = "";
        for (const key of keys) {
            const _key = this.toInternalKey(key);
            if (ret) {
                ret = ret + '+' + _key;
            }
            else {
                ret = _key;
            }
        }
        return ret;
    }
}
