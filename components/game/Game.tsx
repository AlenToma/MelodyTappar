import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Dimensions, StatusBar } from 'react-native';
import { Note, Midi, IScreen, INoteTick, Position } from '../../types';
import NoteTick from './NoteTick';
import objectUseState from '@alentoma/usestate'
import { GameEngine } from "react-native-game-engine"
import Screen from './Screen';
import HttpClient from '../../objects/HttpClient';
import { MidiFile } from '../../objects/MidiFile';
import YoutubePlayer, { YoutubeIframeRef } from "react-native-youtube-iframe";
import Context from '../../AppContext';
import { isOverlapping } from '../../Methods';
const midURL = "https://raw.githubusercontent.com/AlenToma/rhythmgame/main/midtest.mid";
const videoId = "poLp-pJphWw";
let currentTime = 0;
let logged = false;
let loggPos = false;
let ticks = 0;
const calculate = (note: Note,
    position: Position,
    height: number,
    file: MidiFile,
    currentTime: number,
    addToPos?: boolean
) => {
     height += note.position?.height ?? 0
    const hTop = addToPos && position ? height - position.top : height;
    const applyData = () => {
        const bpm = file.file.header.tempos[0].bpm;
       //const bpm = 30;
        const crotchet = bpm / 60;
        const timer = ((crotchet / hTop) * 1000);
        const step = 3;
        if (!logged) {
            logged = true;
            console.log("bpm", bpm, "crotchet", crotchet, "timer", timer, "step", step, "height", height)

        }
        return {
            bpm,
            crotchet,
            timer,
            step
        }
    }
    const bpmInfo = applyData()
    let time = note.time;
    let secondsPerBeat = (1 / bpmInfo.crotchet);
    const noteHeight = position.height
    const timeDis = ((currentTime + 0.1 ) - time);

    const speed = (hTop / secondsPerBeat)   
    let songposition = (timeDis * speed) ;
    if (addToPos && songposition > noteHeight)
        songposition += position.top;
    const y = songposition;
    //console.log(currentTime,time, noteHeight)
    /* if (y > 0)
         console.log("time", time,
             "noteHeight", noteHeight,
             "timeDis", timeDis,
             "speed", speed,
             "songposition", songposition,
             "y", y,
             "height", height,
             "currentTime", currentTime);*/

    return {
        top: y >= noteHeight ? y : (isNaN(y) ? height - (noteHeight * 3) : undefined),
        speed: speed,
        ...bpmInfo
    }
}

const MoveFinger = (entities: any, { touches }: any) => {
    ticks++;
    //console.log("test")
    //-- I'm choosing to update the game state (entities) directly for the sake of brevity and simplicity.
    //-- There's nothing stopping you from treating the game state as immutable and returning a copy..
    //-- Example: return { ...entities, t.id: { UPDATED COMPONENTS }};
    //-- That said, it's probably worth considering performance implications in either case.
    const height = Dimensions.get("window").height;
    const screen = entities[1] as IScreen;
    const keys = Object.keys(entities);
    const positions = {} as any;
    for (const key of keys) {
        const component = entities[key] as INoteTick;

        if (component.type != "Note" || component.overlaping)
            continue;

        if (!component.enabled && component.position.top + component.position.height < height) {
            const data = calculate(component.note, component.position, height, screen.file, screen.player.getTime());
            //console.log("enabled", component.note.name, component.panel)
            if (data.top != undefined) {
                positions[key] = {
                    ...component.position,
                    top: data.top - component.position.height,
                    noteCalculatedTick: data,
                    panelType: component.panel
                };
                if (isOverlapping(Object.values(positions), positions[key])) {
                    component.enabled = false;
                    component.overlaping = true;
                    delete positions[key];
                    console.log("overlapping")
                } else
                    component.enabled = true;

            }
        } else if (component.enabled && component.position.noteCalculatedTick) {
            const data = calculate(component.note,
                component.position,
                height,
                screen.file,
                screen.player.getTime(), true);

            if (component.position.top + component.position.height > height) {
                component.enabled = false;
            }

            if (data.top != undefined) {
                positions[key] = {
                    ...component.position,
                    top: data.top,
                    panelType: component.panel
                }
                if (isOverlapping(Object.values(positions), positions[key])) {
                    component.enabled = false;
                    component.overlaping = true;
                    delete positions[key];
                    console.log("overlapping")
                }
            }

        }
    }
    if (!loggPos) {
        console.log(positions)
        loggPos = true;
    }
    const addedComponents = [] as Position[];
    for (const key of keys.
        filter((key) => !(entities[key].type != "Note" || positions[key] === undefined || !entities[key].enabled))) {
        const component = entities[key] as INoteTick;
        positions[key].panelType = component.panel;
        if (addedComponents.length > 0 && isOverlapping(addedComponents, positions[key])) {
            component.enabled = false;
            component.overlaping = true;
            console.log("overlapping --- 1")
            continue;
        }
        component.position = { ...positions[key], top: positions[key].top }
        addedComponents.push(component.position)
    }
    if (screen && screen.player) {
        /* screen.leftLine?.forEach(x => {
             const data = calculate(x, Dimensions.get("window").height, screen.file, screen.player.getTime());
             if (x.position && data.top !== undefined) {
                 console.log("enabled", x.name)
                 x.position = { ...x.position, top: x.position.top + data.step };
                 x.enabled = true
             }
         })*/
    }
    return entities;
};

export default () => {
    const state = objectUseState({
        file: undefined as MidiFile | undefined,
        playing: false
    }, true);
    const appContext = React.useContext(Context)
    const [time, setTime] = useState(0);
    const timer = useRef<any>();
    const playerRef = useRef<YoutubeIframeRef>(null);

    React.useEffect(() => {
        (async () => {
            const midiFile = (await HttpClient.GetJson(midURL)) as Midi;
            const file = new MidiFile(midiFile, appContext.windowSize.height);
            await file.build();
            state.file = file;
            validateCurrentTime();
        })();
        return () => clearTimeout(timer.current);
        // timer.current = setInterval(() => currentTime += 0.01, 1)
    }, [])



    React.useEffect(() => {
        console.log("poistion Updated")
    }, [state.file?.lines[0][0].position])


    useEffect(() => {
        (async () => {
            validateCurrentTime();
            /* if (playerRef.current && state.playing && state.file?.getFirstNote() && currentTime < state.file.getFirstNote().time) {
                 console.log("Seeking To", state.file.getFirstNote().time)
                 playerRef.current?.seekTo(state.file.getFirstNote().time, true);
             }*/
        })();
    }, [state.playing, playerRef.current])


    const validateCurrentTime = async () => {
        if (playerRef.current) {
            currentTime = await playerRef.current.getCurrentTime();
            setTime(currentTime)
        }

        timer.current = setTimeout(validateCurrentTime, 100);

    }

    const entities = () => {
        const data = {
            1: {
                renderer: Screen,
                file: state.file,
                type: "Screen",
                player: {
                    getTime: () => currentTime
                }
            }
        } as any
        let index = 2;
        state.file?.lines[0].forEach(x => data[index++] = {
            renderer: NoteTick,
            position: x.position,
            note: x,
            panel: "Left",
            enabled: false,
            type: "Note"
        });

        state.file?.lines[1].forEach(x => data[index++] = {
            renderer: NoteTick,
            position: x.position,
            note: x,
            panel: "Middle",
            enabled: false,
            type: "Note"
        });

        state.file?.lines[2].forEach(x => data[index++] = {
            renderer: NoteTick,
            position: x.position,
            note: x,
            panel: "Right",
            enabled: false,
            type: "Note"
        });

        return data;
    }

    if (!state.file)
        return null;

    return (
        <>
            <View style={{
                position: "absolute",
                top: 0,
                alignItems: "center",
                zIndex: 100,
                height: 120,
                width: 200,
                backgroundColor: "red"
            }}>
                <YoutubePlayer
                    ref={playerRef}
                    height={200}
                    width={200}
                    play={true}
                    videoId={videoId}
                    onChangeState={(event) => {
                        console.log(event)
                        if (event == "playing")
                            state.playing = true;
                        if (["paused", "ended"].includes(event)) {
                            state.playing = false;
                        }
                    }}
                />
                <Text style={{ fontSize: 15, color: "white" }}>{time}</Text>
            </View>

            {
                playerRef.current ? (
                    <GameEngine
                        style={[styles.container, { zIndex: 99 }]}
                        systems={[MoveFinger]}
                        running={state.playing}
                        entities={entities()}
                    >
                        <StatusBar hidden={true} />
                    </GameEngine>
                ) : null
            }
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF"
    }
});