import { INoteTick } from '../../types';
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import objectUseState from '@alentoma/usestate';
import Context from '../../AppContext';

export default ({ note, position, panel, enabled }: INoteTick) => {
    const appContext = React.useContext(Context)
    useEffect(()=> {
        if (enabled){
          //  console.log("hhahaha enabled", position)
        }
    },[enabled])
    if (!enabled)
        return null;
    let left = "0%";

    if (panel == "Left")
        left = "7%";

    if (panel == "Middle")
        left = "37%";

    if (panel == "Right")
        left = "67%";

    return (<View style={[style.block, { ...position }, { left, width:"25%" }]}>
        <Text>
            {note.name + " " +left}
        </Text>
        <Text>
            {panel}
        </Text>
    </View>)
}

const style = StyleSheet.create({
    block: {
        borderColor: "white",
        position: "absolute",
        borderRadius:10,
        borderWidth:1,
        backgroundColor:"white"
    }

});