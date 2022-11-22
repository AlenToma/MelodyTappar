import { Dimensions } from "react-native";
import { PanelPosition } from "../types";
import { lerp } from "../Methods";
export class WindowPropeties {
    height: number;
    width: number;
    panelWidth: number;
    noteHeight: number;
    leftNotePosition: number;
    middleNotePosition: number;
    rightNotePosition: number;
    panelBottomHeight: number;
    rotateX: number = 40;
    hitPosition: number;
    noteWidth: number;
    constructor() {
        this.height = Dimensions.get("window").height;
        this.width = Dimensions.get("window").width;
        this.panelWidth = this.width * .295;
        this.noteHeight = 92;
        this.noteWidth = lerp(0, this.panelWidth , 0.9);
        this.panelBottomHeight = (0.20 * this.height)
        this.leftNotePosition = lerp(0, this.panelWidth - (this.noteWidth / 2) , 0.39);
        this.middleNotePosition = lerp(0, (this.panelWidth * 2) -(this.noteWidth / 2) , 0.8);
        this.rightNotePosition = lerp(0, (this.panelWidth * 3) -(this.noteWidth / 2) , 0.89);
        this.hitPosition = (this.height - (this.panelBottomHeight / 2)) + this.noteHeight;
    }

    getrotetXProcent() {
        return Math.ceil(Math.abs(Math.cos(this.rotateX)) * 100.00)
    }

    rotateXHeight(height: number) {
        const rh = (height * Math.abs(Math.cos(this.rotateX)))

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