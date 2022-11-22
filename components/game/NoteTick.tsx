import { INoteTick } from '../../types';
import React, { useEffect, useRef, useState } from 'react';
import { Vibration, StyleSheet, View, Animated } from 'react-native';
import Context from '../../AppContext';
import styles from '../../styles';
import Icons from '../../ui/Icons';
//{ note, position, enabled, touched },INoteTick
export default class NoteTick extends React.PureComponent<INoteTick, any> {
    state: any;
    constructor(props: INoteTick) {
        super(props);
        this.state = {
            lineGlow: false,
            counter: 0
        }
    }

    componentDidUpdate(prevProps: Readonly<INoteTick>, prevState: Readonly<any>, snapshot?: any): void {
        if (this.props.touched && prevProps.touched != this.props.touched)
            Vibration.vibrate(10)
    }

    render() {
        const { note, position, enabled, touched } = this.props;
        if (!enabled || note.isOutOfRange())
            return null;
        let touchedStyle = undefined;
        if (touched) {
            touchedStyle = styles.noteTouched;
        }

        let backgroundColor = "#7944da";
        let innerGlow = "#b5a7ef"
        if (note.panelPosition === "Middle") {
            backgroundColor = "#38abe9";
            innerGlow = "#84f4ef";
        }
        else if (note.panelPosition === "Right") {
            backgroundColor = "#ecb336";
            innerGlow = "#eadc98";
        }
        const glowStyle = this.state.lineGlow ? styles.noteGlowState2 : styles.noteGlowState1;
        this.state.counter++;
        if (this.state.counter % 30 === 0)
            this.state.lineGlow = !this.state.lineGlow;
        return (
            <View
                key={note.noteIndex}
                pointerEvents="none"
                style={[style.block,
                { ...position },
                {
                    opacity: touched ? 0.5 : 1,
                    backgroundColor: backgroundColor,
                    borderRadius:10,
                    borderTopLeftRadius:position.topShadow>0 ? 0 : 10,
                    borderTopRightRadius:position.topShadow>0 ? 0 : 10
                }, touchedStyle]} >
                {
                    position.topShadow > 0 ? (<View style={[style.shadow, {
                        width: position.width,
                        height: position.topShadow,
                        marginBottom: position.height,
                        backgroundColor: backgroundColor
                    }]} />) : null
                }
                <View style={[style.appButtonText, glowStyle]} />
                <View style={[style.round, { backgroundColor: innerGlow }]}></View>
            </View>
        )
    }
}

const style = StyleSheet.create({
    block: {
        borderColor: "#CCC",
        position: "absolute",
        borderRadius: 5,
        borderWidth: 2,
        zIndex: 99,
        padding: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        justifyContent: "center",
        alignItems: "center",
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0

    },

    shadow: {
        height: 100,
        width: 200,
        position: "absolute",
        backgroundColor: "red",
        bottom: "100%",
        opacity: 0.2,
        borderRadius: 10,
        zIndex: -1,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
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