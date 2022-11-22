import { MidiFile } from "./objects/MidiFile";
import { YoutubeIframeRef } from "react-native-youtube-iframe";
import { WindowPropeties } from "./objects/WindowPropeties";
import ScreenNotes from "./objects/ScreenNotes";
import { ColorValue } from "react-native";
export type PanelPosition = "Left" | "Middle" | "Right";
export type FileType = "Midi" | "Mboy"
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
    totalTick: number;
    markers?:[];
    file: MidiFile;
    tick: (videoTime: number, timeInitiated: number, gameTimer: GameTimer) => Position;
    isOutOfRange: () => boolean;
    addToScreen: () => boolean;
    touchHandled: boolean;
    addScore: () => number;
    getBottom: () => number;
}

export type GameTimer = {
    current: number,
    delta: number,
    previous: number,
    previousDelta: number,
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
    panelType?: PanelPosition,
    topShadow: number;
}

export type Marker = {
    id: string;
    code: string;
    color: ColorValue
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
        color: ColorValue
    }
}

export type Midi = {
    header: {
        name: string;
        ppq: number;
        tempos: {
            bpm: number;
            ticks: number;
            start_pos: number;
        }[]
    },
    tracks: Tracks[],
    markers?: Marker[];
}

export type IScreen = {
    glowLines: number[],
    notes: ScreenNotes<INoteTick>,
}

export type INoteTick = {
    note: INote,
    overlaping?: boolean,
    touched?: boolean,
    position: Position,
    enabled: boolean
} & ObjectType


export type InfoBeholder = {
    ticks: number;
    currentVideoTime: number;
    timeInitiated: number;
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