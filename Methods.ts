import { MidiFile } from "./objects/MidiFile";
import { WindowPropeties } from "./objects/WindowPropeties";
import { Position, INote, FileType } from "./types";
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

export const lerp = (v0: number, v1: number, t: number) => {
    return v0 * (1 - t) + v1 * t
}

export const translateJson = (json: any, windowPropeties: WindowPropeties) => {
    try {
        const data = {} as MidiFile;
        const type = (json.header != undefined ? "Midi" : "Mboy") as FileType;
        if (type === "Midi")
            return new MidiFile(json, windowPropeties, type);
        const midi = {} as any;
        const tempo = json.tempo;
        const targetTempo = 240;
        midi.header = {
            tempos: [{
                bpm: tempo,
                start_pos: json.start_pos
            }],
        }
        midi.markers = json.markers;
        const getYPosition = (mboyNote: any, bar: any, trackIndex: number) => {
            const q = bar.index * (bar.quarters_count * windowPropeties.noteHeight)
            let appender = (bar.index * 15 * (windowPropeties.noteHeight));
            let y = windowPropeties.height - (appender + mboyNote.pos + q);

            return y;
        }


        midi.tracks = json.tracks.map((x: any, i: number) => {
            /*  if (i != 0)
                  return { notes: [] };*/
            return {
                instrument: {
                    family: x.instrument,
                    color: x.color,
                    name: x.name,
                    number: x.quarters_count
                },
                notes: x.bars.flatMap((b: any) => {
                    return b.notes.map((n: any) => {
                        return {
                            panelPosition: i == 0 ? "Left" : (i == 1 ? "Middle" : "Right"),
                            duration: n.len,
                            time: getYPosition(n, b, i),
                            markers: n.markers
                        }
                    })
                })
            }
        })

        // this is only a test, we may have to have support to muti trackas later on 
        midi.tracks[0].notes = midi.tracks.flatMap((x: any) => x.notes);
        //console.log(midi.tracks[0].notes)
        return new MidiFile(midi, windowPropeties, type);
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export const getbpmInfo = (targetBpm: number) => {
    return {
        bpm: targetBpm,
        crotchet: 60 / targetBpm,
        speedCrotchet: targetBpm / 60
    }
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