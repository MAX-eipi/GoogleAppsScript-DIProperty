export class DIProperty {
    private static readonly _factories: Record<string, Record<string, () => any>> = {};
    private static readonly _container: Record<string, Record<string, any>> = {};

    public static bind<T>(key: Function, factory: () => T, groupKey = 'global'): void {
        if (!(groupKey in this._factories)) {
            this._factories[groupKey] = {};
        }
        this._factories[groupKey][key.name] = factory;
    }

    public static inject(target: Function, groupKey = 'global'): any {
        const self = this;
        return function (_target: any, propertyKey: string): PropertyDescriptor {
            return {
                configurable: false,
                enumerable: false,
                get: () => {
                    if (!(groupKey in self._container)) {
                        self._container[groupKey] = {};
                    }
                    if (!(target.name in self._container[groupKey])) {
                        self._container[groupKey][target.name] = self._factories[groupKey][target.name]();
                    }
                    return self._container[groupKey][target.name]
                }
            }
        }
    }
}