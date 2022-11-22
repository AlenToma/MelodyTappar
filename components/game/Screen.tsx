import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Vibration } from 'react-native';
import { INote, IScreen, InfoBeholder, PanelPosition, Renderer, INoteTick, Position } from '../../types';
import Context from '../../AppContext';
import GlobalState from '../../objects/GlobalState';
import objectUseState from '@alentoma/usestate'
const getGlow = (position: PanelPosition | number, glowLines: number[]) => {
    if (glowLines.length == 0)
        return;
    const positions = ["Left", "Middle", "Right"]
    const p = (typeof position === "number" ? positions[position] : position) as PanelPosition;
    const glowStyle = { ...style.glow };
    let note = undefined;
    for (const index of glowLines) {
        const n = GlobalState.getItem().file.renderedNotes[index]
        if (n && n.panelPosition === p) {
            note = n;
            break;
        }
    }
    if (note === undefined)
        return undefined;
    let backgroundColor = "#7944da";
    if (p) {
        backgroundColor = "#38abe9";
    }
    else if (p) {
        backgroundColor = "#ecb336";
    }
    glowStyle.backgroundColor = backgroundColor;
    return glowStyle;
}

export default (props: IScreen) => {
    const appContext = React.useContext(Context);
    const state = objectUseState({
        innerGlow: "#b5a7ef"
    })
    const timer = useRef<any>()


    useEffect(() => {
        timer.current = requestAnimationFrame(designTimer)
        return () => cancelAnimationFrame(timer.current)
    }, [])

    const designTimer = async (time: number) => {

        if (GlobalState.getItem().ticks % 100 === 0) {
            state.innerGlow = state.innerGlow == "#eadc98" ? "#b5a7ef" : "#eadc98";
        }
        timer.current = requestAnimationFrame(designTimer)
    }
    return (
        <View pointerEvents='none' style={[style.container, {
            ...appContext.windowSize
        }]}>
            <View style={[style.road]}>
                <Text style={{
                    position: "absolute",
                    color: "white",
                    fontSize: 15,
                    top: "50%", left: "40%"
                }}>Score:{GlobalState.getItem().file.renderedNotes.length + "/" + GlobalState.getItem().score}</Text>
                <View style={[style.roadPanels,
                {
                    borderLeftWidth: 0,
                    width: appContext.windowSize.panelWidth
                },
                getGlow("Left", props.glowLines)]
                }>
                </View>
                <View style={[style.roadPanels,
                { borderLeftWidth: 0, width: appContext.windowSize.panelWidth },
                getGlow("Middle", props.glowLines)]} >
                </View>
                <View style={[style.roadPanels,
                { borderRightWidth: 0, width: appContext.windowSize.panelWidth },
                getGlow("Right", props.glowLines)]} >
                </View>
                <View style={[style.bottomPanel, { height: appContext.windowSize.panelBottomHeight }]} >
                    {
                        [0, 1, 2].map((x) => <View style={[
                            style.bottomButton,
                            getGlow(x, props.glowLines),
                            {

                                width: appContext.windowSize.panelWidth - 10

                            }]} key={x} />)
                    }
                    <View style={[style.glow, style.line, { backgroundColor: state.innerGlow }]}></View>
                </View>
            </View>
        </View>
    )
}

const style = StyleSheet.create({
    container: {
        zIndex: 1,
        height: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#160d30",

    },

    line: {
        width: "92%",
        height: 5,
        position: "absolute",
        left: 12.5,
        opacity:0.5
    },

    glow: {
        backgroundColor: "#38abe9",
        opacity: 0.4,
        shadowColor: "#000000",
        shadowOpacity: 0.8,
        shadowRadius: 2,
        shadowOffset: {
            height: 1,
            width: 1
        }
    },

    bottomPanel: {
        width: "101%",
        left: -1,
        borderTopColor: "#160d30",
        borderTopWidth: 2,
        position: "absolute",
        bottom: 0,
        backgroundColor: "#160d30",
        opacity: 0.8,
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1
    },

    bottomButton: {
        backgroundColor: "#000",
        borderRadius: 20,
        height: "90%",
        borderWidth: 1,
        overflow: "hidden",
        marginRight: 5,
        opacity: 0.5,

    },

    road: {
        backgroundColor: "#444468",
        width: "90%",
        height: "100%",
        borderColor: "#CCC",
        borderWidth: 0.5,
        borderRadius: 20,
        flexDirection: "row",
        borderBottomWidth: 0,
    },

    roadPanels: {
        opacity: 0.2,
        width: "33.333%",
        height: "100%",
        borderRightColor: "#CCC",
        borderWidth: 0.5,
        alignItems: "center",
        zIndex: 20
    }
})