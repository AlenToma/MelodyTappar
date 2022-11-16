import { INote, PanelPosition, Position } from '../types';
import { MidiFile } from './MidiFile';
let loggedbpm = false;
export default class Note implements INote {
    time: number;
    duration: number;
    durationTicks: number;
    midi: number;
    name: string;
    ticks: number;
    velocity: number;
    enabled: boolean;
    position: Position;
    noteIndex: number;
    panelPosition: PanelPosition;
    file: MidiFile;
    totalTick: number;
    constructor(jsonNote: INote, parentFile: MidiFile) {
        this.time = jsonNote.time;
        this.duration = jsonNote.duration;
        this.durationTicks = jsonNote.durationTicks;
        this.midi = jsonNote.midi;
        this.ticks = jsonNote.ticks;
        this.velocity = jsonNote.velocity;
        this.enabled = jsonNote.enabled;
        this.position = jsonNote.position;
        this.noteIndex = jsonNote.noteIndex;
        this.panelPosition = jsonNote.panelPosition;
        this.name = jsonNote.name;
        this.file = parentFile;
        this.totalTick = 0;
    }

    private calculate = (currentTime: number) => {
        const hTop = this.file.windowPropeties.height - this.position.top;
        const bpm = this.file.file.header.tempos[0].bpm;
        const crotchet = bpm / 60;
        const timer = ((crotchet / hTop) * 900);
        const bpmInfo = { bpm, crotchet, timer }
        if (hTop < 0) {
            console.log("hTop", hTop);
            return;
        }

        this.position.noteCalculatedTick = bpmInfo;
        if (!loggedbpm) {
            loggedbpm = true;
            console.log(bpmInfo)
        }

        const totalTime = this.file.gameTime;
        const stepsToAdd = (hTop / bpmInfo.bpm);
       // const stepsToAdd = (hTop / step);

        if (stepsToAdd < 0 || this.position.top > this.file.windowPropeties.height) {
            console.log("stepsToAdd", stepsToAdd)
            return;
        }
        this.position.top += stepsToAdd * bpmInfo.timer;
    }
    // This should be trigged only once each tick
    tick(videoTime: number) {
        if (this.totalTick + 1 <= this.ticks)
            this.totalTick++;
        this.calculate(videoTime);
        if (this.position.top > this.file.windowPropeties.height) {
            this.enabled = false;
        }
        return this.position;
    }

    isOutOfRange() {
        return (this.position.top > this.file.windowPropeties.height);
    }
}