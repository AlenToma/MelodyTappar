import { GameTimer, INote, PanelPosition, Position } from '../types';
import { MidiFile } from './MidiFile';
import { lerp } from '../Methods'
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
    destroyd: boolean = false;
    initPosition: Position;
    timerStart: number = -1;
    touchHandled: boolean = false;
    totalScoreToAdd: number;
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
        this.initPosition = { ...this.position }
        this.totalScoreToAdd = 1;
        if (Math.floor(this.position.topShadow / this.position.height) > 2)
            this.totalScoreToAdd += Math.floor(this.position.topShadow / this.position.height);
        else this.position.topShadow = 0;

    }

    addScore() {
        if (this.totalScoreToAdd > 0) {
            this.totalScoreToAdd--;
            return 1;
        }
        return 0;
    }

    /// The formula is 60000 / (BPM * PPQ) (milliseconds).
    private calculate = (currentTime: number, timeInitiated: number, gameTimer: GameTimer) => {
        if (currentTime < this.time && this.file.fileType === "Midi") {
            return;
        }

        if (this.timerStart ===-1)
            this.timerStart = timeInitiated;

        const deltaTime = currentTime - this.timerStart;
        this.timerStart = currentTime;
        const distanseToTarget = this.file.windowPropeties.hitPosition - this.position.top;
        const initdistanseToTarget = this.file.windowPropeties.hitPosition - this.initPosition.top
    

        const bpmInfo = { bpm:this.file.file.header.tempos[0].bpm, crotchet:this.file.crotchet, roadLength: this.file.gameTime, speedCrotchet: this.file.speedCrotchet }
        const max = this.file.windowPropeties.hitPosition + this.position.topShadow;
        
        //console.log(deltaTime)
        // console.log(speed, gameTimer.delta)
        const timeIni = (currentTime - timeInitiated)
        const time = (this.time * 2)
        let t = (timeIni / time);
        if (t > 1 && this.file.fileType === "Midi") {
            this.destroyd = true;
            this.enabled = false;
            return;
        }

        let stepPerBeat =  2.0 * this.file.crotchet * gameTimer.delta
        //console.log(stepPerBeat, speed, gameTimer.delta, timeIni)
        if (this.file.fileType == "Mboy" && this.position.top > this.file.windowPropeties.hitPosition) {
            this.destroyd = true;
            this.enabled = false;
            console.log("Destryed")
            return;
        }
        this.position.noteCalculatedTick = {
            crotchet: bpmInfo.crotchet,
            timer:0,
            bpm: bpmInfo.bpm
        };
        if (!loggedbpm) {
            loggedbpm = true;
            console.log(bpmInfo)
        }
        const top = lerp(this.initPosition.top, max, t);
        // console.log(this.position.top, stepPerBeat, this.noteIndex)
        this.position.top += stepPerBeat
    }
    // This should be trigged only once each tick
    tick(videoTime: number, timeInitiated: number, gameTimer: GameTimer) {

        if (this.totalTick + 1 <= this.ticks)
            this.totalTick++;
        this.calculate(videoTime, timeInitiated, gameTimer);
        if (this.isOutOfRange()) {
            this.enabled = false;
        }
        return this.position;
    }

    getBottom() {
        return (this.file.windowPropeties.height - this.file.windowPropeties.panelBottomHeight);
    }

    addToScreen() {
        if (this.file.fileType === "Mboy")
            return this.position.top + this.position.height + this.position.topShadow >= 0
        else return this.position.top > 0;
    }

    isOutOfRange() {
        return this.destroyd || (this.position.top > this.file.windowPropeties.height);
    }
}