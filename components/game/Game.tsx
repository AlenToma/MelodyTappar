import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Dimensions, StatusBar } from 'react-native';
import { Note, Midi, IScreen, INoteTick, Position, InfoBeholder } from '../../types';
import NoteTick from './NoteTick';
import objectUseState from '@alentoma/usestate'
import { GameEngine } from "react-native-game-engine"
import Screen from './Screen';
import HttpClient from '../../objects/HttpClient';
import { MidiFile } from '../../objects/MidiFile';
import YoutubePlayer, { YoutubeIframeRef } from "react-native-youtube-iframe";
import Context from '../../AppContext';
import { isOverlapping } from '../../Methods';
import InfoHolder from './InfoHolder';
import MoveNotes from './System/MoveNotes';
import Touches from './System/Touches';
const midURL = "https://raw.githubusercontent.com/AlenToma/rhythmgame/main/midtest.mid";
const videoId = "poLp-pJphWw";

export default () => {
    const appContext = React.useContext(Context)
    const state = objectUseState({
        file: undefined as MidiFile | undefined,
        playing: false,
    }, true);

    const [time, setTime] = useState(0);
    const timer = useRef<any>();
    const playerRef = useRef<YoutubeIframeRef>(null);

    React.useEffect(() => {
        (async () => {
            const midiFile = (await HttpClient.GetJson(midURL)) as Midi;
            const file = new MidiFile(midiFile, appContext.windowSize.height);
            await file.build();
            appContext.inforHolder = {
                windowSize: appContext.windowSize,
                ticks: 0,
                currentVideoTime: 0,
                file: file,
                score: 0
            } as InfoBeholder;
            state.file = file;
        })();
        return () => clearTimeout(timer.current);
        // timer.current = setInterval(() => currentTime += 0.01, 1)
    }, [])


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
        clearTimeout(timer.current);
        if (playerRef.current) {
            appContext.inforHolder.currentVideoTime = await playerRef.current.getCurrentTime();
            setTime(appContext.inforHolder.currentVideoTime)
        }

        timer.current = setTimeout(validateCurrentTime, 100);

    }

    const entities = () => {
        const data = {
            screen: {
                renderer: Screen,
            },
            infoHolder: appContext.inforHolder
        } as any
        let index = 2;
        state.file?.lines[0].forEach(x => data[index++] = {
            renderer: NoteTick,
            position: { ...x.position, left: 0.07 * appContext.windowSize.width },
            note: x,
            panel: "Left",
            enabled: false,
            type: "Note"
        });

        state.file?.lines[1].forEach(x => data[index++] = {
            renderer: NoteTick,
            position: { ...x.position, left: 0.37 * appContext.windowSize.width },
            note: x,
            panel: "Middle",
            enabled: false,
            type: "Note"
        });

        state.file?.lines[2].forEach(x => data[index++] = {
            renderer: NoteTick,
            position: { ...x.position, left: 0.67 * appContext.windowSize.width },
            note: x,
            panel: "Right",
            enabled: false,
            type: "Note"
        });

        return data;
    }

    if (!appContext.inforHolder.file)
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
                        systems={[MoveNotes]}
                        running={state.playing}
                        entities={entities()}>
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
        backgroundColor: "#FFF",
        width: "100%"
    }
});