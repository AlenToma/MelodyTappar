import { isOverlapping, getbpmInfo } from "../Methods";
import { Midi, INote, PanelPosition, Position, FileType } from "../types";
import Note from "./Note";
import { WindowPropeties } from "./WindowPropeties";
export class MidiFile {
    noteIndex: number;
    max: number;
    file: Midi;
    gameTime: number;
    renderedNotes: INote[];
    fileType: FileType;
    private notes: INote[];
    windowPropeties: WindowPropeties;
    crotchet: number;
    speedCrotchet: number;
    constructor(mFile: Midi, windowPropeties: WindowPropeties, fileType: FileType) {
        this.noteIndex = 0;
        this.max = 10000;
        this.file = mFile;
        this.renderedNotes = [];
        this.notes = mFile.tracks[0].notes;
        //console.log("Length", this.notes.length)
        this.gameTime = 0;
        this.windowPropeties = windowPropeties;
        this.fileType = fileType;
        const bpmInfo = getbpmInfo(this.file.header.tempos[0].bpm);
        this.crotchet = bpmInfo.crotchet;
        this.speedCrotchet = bpmInfo.speedCrotchet;
    }

   


    private nextPanelPosition(): PanelPosition {

        if (this.renderedNotes.length <= 0)
            return "Left";
        const lastNotes = this.getLastNote();
        if (lastNotes.panelPosition === "Left")
            return "Middle";

        if (lastNotes.panelPosition === "Middle")
            return "Right";

        return "Left";
    }

    getLastNote() {
        return this.renderedNotes.last() as INote;
    }

    getFirstNote() {
        return this.renderedNotes.findAt(0) as INote;
    }


    add() {
        const note = this.notes[this.noteIndex];
        const panelPositionPosition = this.fileType === "Midi" ? this.nextPanelPosition() : note.panelPosition;

        const h = this.fileType === "Mboy" ? (note.duration / this.windowPropeties.noteHeight) : (note.duration * this.windowPropeties.noteHeight);
        let y = (this.windowPropeties.hitPosition - (this.windowPropeties.hitPosition * note.time));

        if (this.fileType === "Mboy") {
            y = note.time;
        }

        const node = new Note({
            ...note, ...{
                noteIndex: this.renderedNotes.length,
                panelPosition: panelPositionPosition,
                position: {
                    top: y,
                    topShadow: 0,
                    height: this.windowPropeties.noteHeight,
                    width: this.windowPropeties.noteWidth,
                    panelType: panelPositionPosition,
                    left: this.windowPropeties.getbtnLeft(panelPositionPosition)
                }
            }
        } as INote, this);
        if ((this.fileType == "Mboy" || (node.time > 0 && !isOverlapping(this.renderedNotes.map(x => x.position), node.position as Position)))) {
            this.renderedNotes.push(node);
            if (node.time > this.gameTime && this.fileType === "Midi")
                this.gameTime = node.time;
            else if (this.fileType === "Mboy")
                this.gameTime += Math.abs(node.position.top);


        }

        this.noteIndex++;
    }

    async build() {
        while (this.noteIndex < this.notes.length && this.renderedNotes.length < this.max) {
            this.add();
        }
    }

}