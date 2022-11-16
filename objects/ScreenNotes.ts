import { INote, INoteTick, PanelPosition, Renderer } from "../types";

export default class ScreenNotes<T> {
    items: Map<any, Renderer<T>>;
    constructor() {
        this.items = new Map();
    }

    get(key: any) {
        return this.items.get(key);
    }

    set(key: any, item: Renderer<T>) {
        this.items.set(key, item);
        return item;
    }

    remove(key: any) {
        this.items.delete(key);
    }

    has(key: any) {
        return this.items.has(key);
    }

    values(position?: PanelPosition) {
        const data = [...this.items.values()]
        if (position)
            return data.filter((x: any) => x.note.panelPosition == position && x.note.enabled === true && !x.note.isOutOfRange());
        return data;
    }
}