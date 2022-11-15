import { INoteTick } from '../../types';
import React, { useEffect, useRef, useState } from 'react';
import { Vibration, StyleSheet, View } from 'react-native';
import Context from '../../AppContext';



export default ({ note, position, panel, enabled, touched }: INoteTick) => {
    const appContext = React.useContext(Context)
    const lineGlow = useRef(false);
    const counter = useRef(0);
    const ttouched = useRef(false as boolean | undefined);
    if (!enabled)
        return null;

    if (touched && ttouched.current !== touched) {
        Vibration.vibrate(10)
    }
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
                width: "25%", opacity: touched ? 0.5 : 1,
                backgroundColor: !touched ? undefined : "red"
            }]} >
            <View style={[style.appButtonText, { backgroundColor: lineGlow.current ? "red" : "#85ff00" }]} />
        </View>
    )
}

const style = StyleSheet.create({
    block: {
        borderColor: "#CCC",
        position: "absolute",
        borderRadius: 10,
        borderWidth: 10,
        zIndex: 99,
        padding: 10,
        backgroundColor: "#009688",
        paddingVertical: 10,
        paddingHorizontal: 12,
        justifyContent: "flex-start",
        paddingTop: 15,
        alignItems: "center",
        shadowColor: 'red',
        elevation: 10,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
    },

    appButtonText: {
        borderRadius: 10,
        width: "70%",
        height: 5,
        backgroundColor: "#85ff00",
        shadowColor: 'red',
        elevation: 5,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
    }
});