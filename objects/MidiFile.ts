import { Midi, Note } from "../types";
export class MidiFile {
    public lines: [Note[], Note[], Note[]];
    currentLineIndex?: number;
    noteIndex: number;
    max: number;
    btnHeight: number;
    renderedNotes: number;
    file: Midi;
    gameTime: number;
    private notes: Note[];
    private height: number;
    constructor(mFile: Midi, screenHeight: number) {
        this.lines = [[], [], []]
        this.currentLineIndex = undefined;
        this.noteIndex = 0;
        this.max = 10000;
        this.btnHeight = 50;
        this.renderedNotes = 0;
        this.file = mFile;
        this.notes = mFile.tracks[0].notes;
        this.height = screenHeight;
        this.gameTime = 0;
    }

    line() {
        if (this.currentLineIndex === undefined)
            this.currentLineIndex = 0;
        else if (this.currentLineIndex + 1 < this.lines.length)
            this.currentLineIndex++;
        else this.currentLineIndex = 0;
        return this.lines[this.currentLineIndex];
    }

    nextLine() {
        let index = this.currentLineIndex || 0;
        if (index + 1 < this.lines.length)
            index++;
        else index = 0;
        return this.lines[index];
    }

    getFirstNote(){
        return this.lines[0][0];
    }

    isOverlapping(intervals: Note[], newInterval: Note) {
        if (!newInterval.position)
            return false;
        const a = newInterval.position.top;
        const b = newInterval.position.top + newInterval.position.height;

        for (const interval of intervals) {
            if (!interval.position)
                continue;
            const c = interval.position.top;
            const d = interval.position.top + interval.position.height;
            if (a < d && b > c) {
                return true;
            }
        }

        return false;
    }


    add() {
        const line = this.line();
        const noteIndex = this.lines.reduce((v, c) => {
            v += c.length;
            return v;
        }, 0)
        const note = this.notes[this.noteIndex];
        const h = (note.duration * this.btnHeight) + this.btnHeight;
        const y = (this.height - (this.height * note.time)) + h;
        const node = {
            ...note, ...{
                position: {
                    top: y,
                    height: h,
                    width: 62,

                }
            }
        } as Note;

        if (!this.isOverlapping(line, node) && !this.isOverlapping(this.nextLine(), node)) {
            line.push(node);
            if (node.time > this.gameTime)
                this.gameTime = node.time;
            this.renderedNotes++;
        }

        this.noteIndex++;
    }

    async build() {
        while (this.noteIndex < this.notes.length && this.renderedNotes < this.max) {
            this.add();
        }
    }

}