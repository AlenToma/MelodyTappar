import { INoteTick } from '../../types';
import React, { useEffect, useRef, useState } from 'react';
import { Vibration, StyleSheet, View } from 'react-native';
import Context from '../../AppContext';
import styles from '../../styles';
import Icons from '../../ui/Icons';

export default ({ note, position, enabled, touched }: INoteTick) => {
    const lineGlow = useRef(false);
    const counter = useRef(0);
    const ttouched = useRef(false as boolean | undefined);
    if (!enabled)
        return null;
    let touchedStyle = undefined;
    if (touched && ttouched.current !== touched) {
        Vibration.vibrate(10)
        touchedStyle = styles.noteTouched;
    }

    let backgroundColor = "#7944da";
    let innerGlow = "#b5a7ef"
    if (note.panelPosition === "Middle") {
        backgroundColor = "#38abe9";
        innerGlow = "#84f4ef";
    }
    else if (note.panelPosition === "Right")
        {
            backgroundColor = "#ecb336";
            innerGlow ="#eadc98";
        }
    const glowStyle = lineGlow.current ? styles.noteGlowState2 : styles.noteGlowState1;
    ttouched.current = touched;
    counter.current++;
    if (counter.current % 30 === 0)
        lineGlow.current = !lineGlow.current;


    return (
        <View
            pointerEvents="none"
            style={[style.block,
            { ...position },
            {
                opacity: touched ? 0.5 : 1,
                backgroundColor: backgroundColor,
            }, touchedStyle]} >
            <View style={[style.appButtonText, glowStyle]} />
            <View style={[style.round,{backgroundColor:innerGlow}]}></View>
        </View>
    )
}

const style = StyleSheet.create({
    block: {
        borderColor: "#CCC",
        position: "absolute",
        borderRadius: 10,
        borderWidth: 2,
        zIndex: 99,
        padding: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        justifyContent: "flex-start",
        paddingTop: 15,
        alignItems: "center",
        shadowColor: 'red',
        elevation: 0,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
      
    },

    round: {
        backgroundColor: "#000",
        opacity: 1,
        width: "80%",
        height: "80%",
        borderRadius: 10,
        top: "10%"
    },

    appButtonText: {
        borderRadius: 10,
        width: "70%",
        height: 3,
        borderWidth: 1,
        overflow: "hidden",
    }
});