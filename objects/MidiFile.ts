import { isOverlapping } from "../Methods";
import { Midi, INote, PanelPosition, Position } from "../types";
import Note from "./Note";
import { WindowPropeties } from "./WindowPropeties";
export class MidiFile {
    noteIndex: number;
    max: number;
    btnHeight: number;
    file: Midi;
    gameTime: number;
    renderedNotes: INote[];

    private notes: INote[];
    windowPropeties: WindowPropeties
    constructor(mFile: Midi, windowPropeties: WindowPropeties) {
        this.noteIndex = 0;
        this.max = 10000;
        this.btnHeight = windowPropeties.noteHeight;
        this.file = mFile;
        this.renderedNotes = [];
        this.notes = mFile.tracks[0].notes;
        this.gameTime = 0;
        this.windowPropeties = windowPropeties;
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
        const panelPositionPosition = this.nextPanelPosition();
        const note = this.notes[this.noteIndex];
        //const h = (note.duration * this.btnHeight) + this.btnHeight;
        const h = this.btnHeight;
        const y = (this.windowPropeties.height - (this.windowPropeties.height * (note.time + note.duration))) + h;
        const node = new Note({
            ...note, ...{
                noteIndex: this.renderedNotes.length,
                panelPosition: panelPositionPosition,
                position: {
                    top: y,
                    height: h,
                    width: this.windowPropeties.noteHeight,
                    panelType: panelPositionPosition,
                    left: this.windowPropeties.getbtnLeft(panelPositionPosition)
                }
            }
        } as INote, this);
        const positions = this.renderedNotes.map(x => x.position) as Position[]
        if (node.time > 0 && !isOverlapping(positions, node.position as Position)) {
            this.renderedNotes.push(node);
            if (node.time > this.gameTime)
                this.gameTime = node.time;
        }

        this.noteIndex++;
    }

    async build() {
        while (this.noteIndex < this.notes.length && this.renderedNotes.length < this.max) {
            this.add();
        }
    }

}