import { MidiFile } from "./objects/MidiFile";
import { YoutubeIframeRef } from "react-native-youtube-iframe";
import { WindowPropeties } from "./objects/WindowPropeties";
import ScreenNotes from "./objects/ScreenNotes";
export type PanelPosition = "Left" | "Middle" | "Right";
export type INote = {
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
    totalTick:number;
    file: MidiFile;
    tick: (videoTime: number) => Position;
    isOutOfRange:()=> boolean;
}

export type NoteCalculatedTick = {
    bpm: number,
    crotchet: number,
    timer: number
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
    notes: INote[];
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
    glowLines: PanelPosition[],
    notes:ScreenNotes<INoteTick>,
}

export type INoteTick = {
    note: INote,
    position: Position,
    enabled?: boolean,
    overlaping?: boolean,
    touched?: boolean
} & ObjectType


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

export type Renderer<T> = {
    renderer: any,
} & T

export type AppContext = {
    windowSize: WindowPropeties
}