import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Vibration } from 'react-native';
import { INote, IScreen, InfoBeholder, PanelPosition, Renderer, INoteTick } from '../../types';
import Context from '../../AppContext';
import GlobalState from '../../objects/GlobalState';
const getGlow = (position: PanelPosition) => {
    const glowStyle = { ...style.glow };
    let backgroundColor = "#7944da";
    if (position === "Middle") {
        backgroundColor = "#38abe9";
    }
    else if (position === "Right") {
        backgroundColor = "#ecb336";
    }
    glowStyle.backgroundColor = backgroundColor;
    return glowStyle;
}

export default (props: IScreen) => {
    const appContext = React.useContext(Context)

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
                props.glowLines.includes("Left") ? getGlow("Left") : undefined]
                }>
                </View>
                <View style={[style.roadPanels,
                { borderLeftWidth: 0, width: appContext.windowSize.panelWidth },
                props.glowLines.includes("Middle") ? getGlow("Middle") : undefined]} >
                </View>
                <View style={[style.roadPanels,
                { borderRightWidth: 0, width: appContext.windowSize.panelWidth },
                props.glowLines.includes("Right") ? getGlow("Right") : undefined]} >
                </View>
                <View style={[style.bottomPanel, { height: appContext.windowSize.panelBottomHeight }]} >
                    {
                        [0, 1, 2].map((x) => <View style={[style.bottomButton, { height: appContext.windowSize.noteHeight, width: appContext.windowSize.panelWidth - 10 }]} key={x} />)
                    }
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
        height: 3,
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