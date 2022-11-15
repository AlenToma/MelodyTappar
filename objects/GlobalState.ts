import { InfoBeholder } from "../types";
const __ignoreKeys = ['__setValue', '__toJson', '__cleanItem'];
class SetterAndGetter {
    constructor(item: any, trigger: (item: any) => void) {
        try {

            let keys = Object.keys(item).filter((x) => !__ignoreKeys.includes(x));
            const prototype = Object.getPrototypeOf(item);

            if (prototype !== undefined && prototype != null) {
                const ignoreKyes = Object.getOwnPropertyNames(Object.prototype);
                keys = [...keys, ...Object.getOwnPropertyNames(prototype)].filter(
                    (x) => !ignoreKyes.includes(x)
                );
            }

            for (let key of keys) {
                let val = item[key];
                if (typeof val === 'object' && !Array.isArray(val) &&
                    val !== undefined &&
                    val !== null &&
                    typeof val !== 'string'
                ) {
                    val = new SetterAndGetter(
                        val,
                        () => trigger(item)
                    );
                }

                Object.defineProperty(this, key, {
                    get: () => val,
                    set: (value) => {
                        let oValue = value;
                        if (typeof value === 'object' &&
                            !Array.isArray(value) &&
                            value !== undefined &&
                            value !== null &&
                            typeof value !== 'string'
                        ) {
                            value = new SetterAndGetter(
                                oValue,
                                () => trigger(item)
                            );
                        }
                        item[key] = oValue;
                        val = value;

                        trigger(item);

                    },
                    enumerable: true,
                });
            }
        } catch (e) {
            console.log(e);
            throw e;
        }
    }
}

class GlobalState<T> {
    private events: EventSubscriper[] = [];
    private globalItem: T;
    constructor(item: T) {
        this.globalItem = new SetterAndGetter(item, this.triggerChange.bind(this)) as any;
    }

    setItem(item: T) {
        this.globalItem = new SetterAndGetter(item, this.triggerChange.bind(this)) as any;
       
    }

    getItem() {
        return this.globalItem;
    }

    subscribe(func: (item: T) => any) {
        this.events.push(new EventSubscriper(func, this.remove.bind(this)))
        return this.events.last() as EventSubscriper;
    }

    private triggerChange(item: T) {
        this.events.forEach(async x => {
            const f = x.func(this.globalItem);
            if (f.then != undefined)
                await f;
        });
    }

    private remove(item: EventSubscriper) {
        this.events.splice(this.events.indexOf(item), 1);
    }

}

class EventSubscriper {
    func: Function;
    unsubscribe: Function;
    constructor(func: Function, unsubscribe: (item: EventSubscriper) => void) {
        this.func = func;
        this.unsubscribe = () => unsubscribe(this);
    }
}

const globalItem= new GlobalState<InfoBeholder>({
    windowSize: { width: 0, height: 0 },
    ticks: 0,
    currentVideoTime: 0,
    file: {},
    score: 0
} as InfoBeholder);

export default globalItem;