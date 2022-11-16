import { Dimensions } from "react-native";
import { PanelPosition } from "../types";
export class WindowPropeties {
    height: number;
    width: number;
    panelWidth: number;
    noteHeight: number;
    leftNotePosition: number;
    middleNotePosition: number;
    rightNotePosition: number;
    panelBottomHeight: number;
    rotateX: number= 40;
    constructor() {
        this.height = Dimensions.get("window").height;
        this.width = Dimensions.get("window").width;
        this.panelWidth = this.width * .295;
        this.noteHeight = 95;
        this.panelBottomHeight = (0.20 * this.height)
        this.leftNotePosition = 0.07 * this.width;
        this.middleNotePosition = 0.37 * this.width;
        this.rightNotePosition = 0.67 * this.width;
    }

    getrotetXProcent(){
        return Math.ceil(Math.abs(Math.cos(this.rotateX)) * 100.00)
    }

    rotateXHeight(height: number){
        const rh =  (height * Math.abs(Math.cos(this.rotateX)))
        
        return (height + (height - rh))
    }

    getbtnLeft(position: PanelPosition) {
        if (position === "Left")
            return this.leftNotePosition;
        if (position === "Middle")
            return this.middleNotePosition;

        return this.rightNotePosition;
    }
}