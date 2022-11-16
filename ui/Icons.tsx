import * as React from 'react'
import { StyleProp, TextStyle, Image } from 'react-native'
import AntDesign from '@expo/vector-icons/AntDesign'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import Ionicons from '@expo/vector-icons/Ionicons'
import MaterialIcons from '@expo/vector-icons/MaterialIcons'
import Entypo from '@expo/vector-icons/Entypo'
import Feather from '@expo/vector-icons/Feather'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import Fontisto from '@expo/vector-icons/Fontisto'
import EvilIcons from '@expo/vector-icons/EvilIcons'
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons'
import { useFonts, loadAsync } from 'expo-font';

const IconTypeArray = {
    AntDesign,
    MaterialCommunityIcons,
    Ionicons,
    MaterialIcons,
    Entypo,
    Feather,
    Fontisto,
    FontAwesome5,
    FontAwesome,
    EvilIcons,
    SimpleLineIcons
} as any;

type ElementType = "AntDesign" | "MaterialCommunityIcons" | "Ionicons" | "MaterialIcons" | "Entypo" | "Feather" | "FontAwesome5" | "FontAwesome" | "Fontisto" | "EvilIcons" | "SimpleLineIcons";

export const fontsLoader = () => {
    const [loaded, setLoaded] = React.useState(false);

    React.useEffect(() => {
        let map = {} as any;
        for (const keyIcon in IconTypeArray) {
            const icon = IconTypeArray[keyIcon];
            map = { ...map, ...icon.font }
        }
   
        loadAsync(map).then(() => setLoaded(true)).catch(e => console.log(e));
    }, [])

    return [loaded] as const;
}

export default (props: { type: ElementType, name: string, size: number, color?: string, style?: StyleProp<TextStyle> }) => {
    const Icon = IconTypeArray[props.type];
    const pType = { ...props } as any;
    delete pType.type;

    return (
        <Icon {...pType} />
    )
}
