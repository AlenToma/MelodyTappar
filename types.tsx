import { MidiFile } from "./objects/MidiFile";
import { YoutubeIframeRef } from "react-native-youtube-iframe";
export type PanelPosition = "Left" | "Middle" | "Right";
export type Note = {
    time: number;
    duration: number;
    durationTicks: number;
    midi: number;
    name: string;
    ticks: number;
    velocity: number;
    enabled: boolean;
    position: Position;
    noteIndex:number;
    panelPosition: PanelPosition
}

export type NoteCalculatedTick = {
    bpm: number,
    crotchet: number,
    timer: number,
    step: number,
    speed: number
}

export type Position = {
    top: number;
    left: number;
    height: number;
    width: number;
    noteCalculatedTick?: NoteCalculatedTick,
    panelType?: PanelPosition
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
    glowLines: PanelPosition[]
}

export type INoteTick = {
    panel: PanelPosition,
    note: Note,
    position: Position,
    enabled?: boolean,
    overlaping?: boolean,
    touched?: boolean
} & ObjectType

export type WindowPropeties = {
    height: number;
    width: number;
}

export type InfoBeholder = {
    ticks: number;
    currentVideoTime: number;
    file: MidiFile;
    windowSize: WindowPropeties;
    score: number;
}

export type ObjectType = {
    type: "Note" | "Screen" | "InfoHolder"
}

export type AppContext = {
    windowSize: WindowPropeties
}