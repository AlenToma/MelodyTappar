import { MidiFile } from "./objects/MidiFile";
import { Note, Position } from "./types";
let loggedbpm = false;
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

export const calculate = (note: Note,
    position: Position,
    height: number,
    file: MidiFile,
    currentTime: number,
    addToPos?: boolean
) => {

    const hTop = height - position.top;
    const applyData = () => {
        const bpm = file.file.header.tempos[0].bpm;
       // const bpm = 120;
        const crotchet = bpm / 60;
        const timer = ((crotchet / hTop) * 10000);
        return {
            bpm,
            crotchet,
            timer
        }
    }
    if (hTop < 0) {
        console.log("hTop", hTop);
        return;
    }
    const bpmInfo = applyData();

    if(!loggedbpm){
        loggedbpm= true;
        console.log(bpmInfo)
    }

    const totalTime = file.gameTime;
    const step = file.renderedNotes * 10;
    const stepsToAdd = (hTop  / step) ;
 
    if (stepsToAdd < 0 || position.top > height) {
        console.log("stepsToAdd", stepsToAdd)
        return;
    } 
    position.top += ((stepsToAdd * bpmInfo.crotchet) * bpmInfo.timer);
}