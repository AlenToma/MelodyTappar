import { INoteTick } from '../../types';
import React, { useEffect, useRef } from 'react';
import { GestureResponderEvent, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import objectUseState from '@alentoma/usestate';
import Context from '../../AppContext';
import HttpClient from '../../objects/HttpClient';

export default ({ note, position, panel, enabled, touched }: INoteTick) => {

    const appContext = React.useContext(Context)


    if (!enabled)
        return null;

    return (<View
        style={[style.block,
        { ...position },
        { width: "25%", opacity: touched ? 0.5 : 1, backgroundColor: !touched ? "white" : "red" }]}>
        <Text>
            {note.name + " " + panel}
        </Text>
        <Text>
            {panel}
        </Text>
    </View>)
}

const style = StyleSheet.create({
    block: {
        borderColor: "#CCC",
        position: "absolute",
        borderRadius: 10,
        borderWidth: 5,
        backgroundColor: "white",
        zIndex: 99,
        padding: 5
    }

});