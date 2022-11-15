import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Dimensions, StatusBar, SafeAreaView } from 'react-native';
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
import GlobalState from '../../objects/GlobalState';

const midURL = "https://raw.githubusercontent.com/AlenToma/rhythmgame/main/midtest.mid";
const videoId = "poLp-pJphWw";

export default () => {
    const appContext = React.useContext(Context)
    const state = objectUseState({
        file: undefined as MidiFile | undefined,
        playing: false,
        init: false
    }, true);

    const [time, setTime] = useState(0);
    const timer = useRef<any>();
    const playerRef = useRef<YoutubeIframeRef>(null);

    React.useEffect(() => {
        (async () => {
            const midiFile = (await HttpClient.GetJson(midURL)) as Midi;
            const file = new MidiFile(midiFile, appContext.windowSize);
            await file.build();
            GlobalState.setItem({
                windowSize: appContext.windowSize,
                ticks: 0,
                currentVideoTime: 0,
                file: file,
                score: 0
            });
            state.file = file;
            console.log(GlobalState.getItem().file.renderedNotes?.length)
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
            GlobalState.getItem().currentVideoTime = await playerRef.current.getCurrentTime();
            setTime(GlobalState.getItem().currentVideoTime)
        }

        timer.current = setTimeout(validateCurrentTime, 100);

    }

    const entities = () => {
        const data = {
            screen: {
                renderer: Screen
            }
        } as any
        let index = 2;
        return data;
    }

    if (!state.file  || GlobalState.getItem().file.renderedNotes === undefined)
        return null;

    return (
        <>
            <SafeAreaView style={styles.container}>
                <View style={styles.youtubeContainer}>
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
                </View>
                <GameEngine
                    style={[styles.gameContainer]}
                    systems={[Touches,MoveNotes]}
                    running={state.playing}
                    entities={entities()}>

                    <Text style={{ fontSize: 15, color: "white" }}>{time}</Text>
                    <StatusBar hidden={true} />

                </GameEngine>

            </SafeAreaView>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFF",
        width: "100%"
    },
    youtubeContainer: {
        position: "absolute",
        top: "5%",
        borderColor: "#CCC",
        borderWidth: 1,
        alignItems: "center",
        zIndex: 100,
        height: 120,
        width: 200,
        left: "25%",
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "#000"
    },
    gameContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        alignItems: "center",
        zIndex: 99,
        height: "100%",
        width: "100%"
    }
});