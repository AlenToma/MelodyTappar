import { MidiFile } from "./objects/MidiFile";
import {  Position, INote } from "./types";
let loggedbpm = false;
export const isOverlapping = (intervals: Position[], newInterval: Position) => {
    if (intervals.length <= 0)
        return false;
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
        if (counter >= 2)
            return true;
    }

    return false;
}

/*export const calculate = (note: INote,
    position: Position,
    height: WindowPropeties,
    file: MidiFile,
    currentTime: number
) => {

    const hTop = height.height - position.top;
    const bpm = file.file.header.tempos[0].bpm;
    const crotchet = bpm / 60;
    const timer = ((crotchet / hTop) * 10000);
    const bpmInfo= {bpm, crotchet, timer}
    if (hTop < 0) {
        console.log("hTop", hTop);
        return;
    }

    position.noteCalculatedTick = bpmInfo;
    if (!loggedbpm) {
        loggedbpm = true;
        console.log(bpmInfo)
    }

    const totalTime = file.gameTime;
    const step = 3300;
    const stepsToAdd = (hTop / step);

    if (stepsToAdd < 0 || position.top > height.height) {
        console.log("stepsToAdd", stepsToAdd)
        return;
    }
    position.top += ((stepsToAdd * bpmInfo.crotchet) * bpmInfo.timer);
}*/