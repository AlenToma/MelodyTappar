import { isOverlapping } from "../Methods";
import { Midi, Note, PanelPosition, Position, WindowPropeties } from "../types";
export class MidiFile {
    noteIndex: number;
    max: number;
    btnHeight: number;
    file: Midi;
    gameTime: number;
    renderedNotes: Note[];
    
    private notes: Note[];
    private windowPropeties: WindowPropeties
    constructor(mFile: Midi, windowPropeties: WindowPropeties) {
        this.noteIndex = 0;
        this.max = 10000;
        this.btnHeight = 90;
        this.file = mFile;
        this.renderedNotes = [];
        this.notes = mFile.tracks[0].notes;
        this.gameTime = 0;
        this.windowPropeties = windowPropeties;
    }

    setNoteX(note: Note) {
        if (note.panelPosition === "Left")
            note.position.left = 0.07 * this.windowPropeties.width;
        else
            if (note.panelPosition === "Middle")
                note.position.left = 0.37 * this.windowPropeties.width;
            else
                if (note.panelPosition === "Right")
                    note.position.left = 0.67 * this.windowPropeties.width;
        return note;
    }

    private nextPanelPosition(): PanelPosition {
        if (this.renderedNotes.length <= 0)
            return "Left";
        const lastNotes = this.getLastNote();
        if (lastNotes.panelPosition === "Left")
            return "Middle";

        if (lastNotes.panelPosition === "Middle")
            return "Right";

        if (lastNotes.panelPosition === "Right")
            return "Left";
        return "Left";
    }

    getLastNote() {
        return this.renderedNotes.last() as Note;
    }

    getFirstNote() {
        return this.renderedNotes.findAt(0) as Note;
    }


    add() {
        const panelPositionPosition = this.nextPanelPosition();
        const note = this.notes[this.noteIndex];
        const h = (note.duration * this.btnHeight) + this.btnHeight;
        const y = (this.windowPropeties.height - (this.windowPropeties.height * note.time)) + h;
        const node = this.setNoteX({
            ...note, ...{
                noteIndex: this.renderedNotes.length,
                panelPosition: panelPositionPosition,
                position: {
                    top: y,
                    height: h,
                    width: 62,
                    panelType: panelPositionPosition
                }
            }
        } as Note);
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