import { MidiFile } from "./objects/MidiFile";
import { YoutubeIframeRef } from "react-native-youtube-iframe";
export type Note = {
    time: number;
    duration: number;
    durationTicks: number;
    midi: number;
    name: string;
    ticks: number;
    velocity: number;
    enabled: boolean;
    position?: Position
}

export type NoteCalculatedTick = {
    bpm: number,
    crotchet: number,
    timer: number,
    step: number,
    speed:number
}

export type Position = {
    top: number;
    left: number;
    height: number;
    width: number;
    noteCalculatedTick?: NoteCalculatedTick

}

export type Tracks = {
    name: string;
    channel: number;
    endOfTrackTicks: number;
    controlChanges: any;
    pitchBends: any[];
    notes: Note[];
    instrument: {
        family: string;
        number: number;
        name: string;
    }
}

export type Midi = {
    header: {
        name: string;
        ppq: number;
        tempos: {
            bpm: number;
            ticks: number;
        }[]
    },
    tracks: Tracks[]
}

export type IScreen = {
    file: MidiFile,
    player: {
        getTime: () => number
    }
} & ObjectType

export type INoteTick = {
    panel: "Left" | "Middle" | "Right",
    note: Note,
    position: Position,
    enabled?: boolean,
} & ObjectType

export type ObjectType = {
    type: "Note" | "Screen"
}

export type AppContext = {
    windowSize: {
        width: number,
        height: number
    }
}