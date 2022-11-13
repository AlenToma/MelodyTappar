import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Note,IScreen } from '../../types';
import NoteTick from './NoteTick';
import objectUseState from '@alentoma/usestate'
import Context from '../../AppContext';




export default (props: IScreen) => {
    const appContext = React.useContext(Context)
    
    return (
        <View style={[style.container, {
            ...appContext.windowSize
        }]}>
            <View style={style.road}>
                <View style={[style.roadPanels, { borderLeftWidth: 0 }]}>
                </View>
                <View style={[style.roadPanels, { borderLeftWidth: 0 }]}>
                </View>
                <View style={[style.roadPanels, { borderRightWidth: 0 }]}>
                </View>
            </View>
        </View>
    )
}

const style = StyleSheet.create({

    container: {
        flex: 1,
        height: "100%",
        backgroundColor: "#000",
        justifyContent: "center",
        alignItems: "center"
    },

    road: {
        width: "70%",
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
        alignItems:"center"
    }
})