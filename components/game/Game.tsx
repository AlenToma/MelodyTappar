import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, Dimensions, StatusBar, SafeAreaView } from 'react-native';
import { INote, Midi } from '../../types';
import NoteTick from './NoteTick';
import objectUseState from '@alentoma/usestate'
import { GameEngine } from "react-native-game-engine"
import Screen from './Screen';
import HttpClient from '../../objects/HttpClient';
import { MidiFile } from '../../objects/MidiFile';
import YoutubePlayer, { YoutubeIframeRef } from "react-native-youtube-iframe";
import Context from '../../AppContext';
import { isOverlapping, translateJson } from '../../Methods';
import MoveNotes from './System/MoveNotes';
import Touches from './System/Touches';
import GlobalState from '../../objects/GlobalState';
import ScreenNotes from '../../objects/ScreenNotes';
import midiTestFile from '../../midiTestFile';
import mboy from '../../mboy'

const midURL = "https://raw.githubusercontent.com/AlenToma/rhythmgame/main/eminem.midi";
const videoId = "Atv-zwhSyFE";

export default () => {
    const appContext = React.useContext(Context)
    const state = objectUseState({
        file: undefined as MidiFile | undefined,
        playing: false,
        init: false
    }, true);

    const [time, setTime] = useState(0);
    const playerRef = useRef<YoutubeIframeRef>(null);

    React.useEffect(() => {
        (async () => {
            //const midiFile = (await HttpClient.GetJson(midURL)) as Midi;
            const file = translateJson(mboy, appContext.windowSize);
            await file.build();
            GlobalState.setItem({
                windowSize: appContext.windowSize,
                ticks: 0,
                currentVideoTime: 0,
                file: file,
                score: 0,
                timeInitiated: -1
            });
            state.file = file;
            console.log(GlobalState.getItem().file.renderedNotes?.length)
        })();
    }, [])


    useEffect(() => {
        (async () => {
            requestAnimationFrame(validateCurrentTime)
        })();
    }, [state.playing, playerRef.current])


    const validateCurrentTime = async (time: number) => {

        if (playerRef.current) {
            const item = GlobalState.getItem();

            item.currentVideoTime = await playerRef.current.getCurrentTime();
            if (item.timeInitiated == -1) {
                item.timeInitiated = item.currentVideoTime;
            }
            setTime(GlobalState.getItem().currentVideoTime)
        }
        requestAnimationFrame(validateCurrentTime)
    }

    const entities = () => {
        const data = {
            screen: {
                renderer: Screen,
                glowLines: [],
                notes: new ScreenNotes()
            }
        } as any
        let index = 2;
        return data;
    }

    if (!state.file || GlobalState.getItem().file.renderedNotes === undefined)
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
                        mute={false}
                        videoId={videoId}
                        onChangeState={(event) => {
                            console.log(event)
                            if (event == "playing") {
                                state.playing = true;
                            }
                            if (["paused", "ended"].includes(event)) {
                                state.playing = false;
                            }
                        }}
                    />
                    <Text style={{ fontSize: 15, color: "white" }}>{time}</Text>
                </View>
                <GameEngine
                    style={[styles.gameContainer]}
                    systems={[MoveNotes, Touches]}

                    running={state.playing}
                    entities={entities()}>
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