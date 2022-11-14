import { Note, Position } from "./types";

export const isOverlapping = (intervals: Position[], newInterval: Position) => {
    const a = newInterval.top;
    const b = newInterval.top + newInterval.height;
    let counter = 0;
    for (const interval of intervals) {
        if (interval == newInterval)
            continue
        const c = interval.top;
        const d = interval.top + interval.height;
        if (a < d && b > c) {
            if (interval.panelType == newInterval.panelType)
                return true;
            counter++;
        }
        if (counter > 2)
            return true;
    }

    return false;
}