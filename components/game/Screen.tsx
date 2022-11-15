import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Vibration } from 'react-native';
import { Note, IScreen, InfoBeholder } from '../../types';
import NoteTick from './NoteTick';
import objectUseState from '@alentoma/usestate'
import Context from '../../AppContext';
import GlobalState from '../../objects/GlobalState';

export default (props: IScreen) => {
    const appContext = React.useContext(Context)


    return (
        <SafeAreaView pointerEvents='none' style={[style.container, {
            ...appContext.windowSize
        }]}>
            <View style={style.road}>
                <Text style={{
                    position: "absolute",
                    color: "white",
                    fontSize: 15,
                    top: "50%", left: "40%"
                }}>Score:{GlobalState.getItem().file.renderedNotes.length + "/" + GlobalState.getItem().score}</Text>
                <View style={[style.roadPanels, { borderLeftWidth: 0 }, props.glowLines.includes("Left") ? style.glow : undefined]} />
                <View style={[style.roadPanels, { borderLeftWidth: 0 }, props.glowLines.includes("Middle") ? style.glow : undefined]} />
                <View style={[style.roadPanels, { borderRightWidth: 0 }, props.glowLines.includes("Right") ? style.glow : undefined]} />
                <View style={[style.bottomPanel, { borderRightWidth: 0 }]} />
            </View>
        </SafeAreaView>
    )
}

const style = StyleSheet.create({
    container: {
        zIndex: 1,
        height: "100%",
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center",

    },

    glow: {
        backgroundColor: "green",
        opacity: 0.4
    },

    bottomPanel: {
        width: "100%",
        borderTopColor: "blue",
        height: "20%",
        borderTopWidth: 0.5,
        position: "absolute",
        bottom: 0,
        backgroundColor: "#000"
    },

    road: {
        width: "90%",
        height: "100%",
        borderColor: "#CCC",
        borderWidth: 1,
        borderRadius: 5,
        flexDirection: "row"
    },

    roadPanels: {
        width: "33.333%",
        height: "100%",
        borderRightColor: "#CCC",
        borderWidth: 0.5,
        alignItems: "center"
    }
})