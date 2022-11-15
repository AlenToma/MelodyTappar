import { Dimensions } from "react-native";
import React, { useEffect, useRef, useState } from 'react';
import { InfoBeholder, INoteTick, IScreen, Position } from "../../../types";
import { calculate, isOverlapping } from "../../../Methods";
import { TouchEvent } from "react-native-game-engine"

export default (entities: any, { touches }: { touches: TouchEvent[] }) => {
    try {
        const infoHolder = entities.infoHolder as InfoBeholder;
        const keys = Object.keys(entities);

        touches.filter(x => x.type === "press").forEach(x => {
            for (const key of keys) {
                const component = entities[key] as INoteTick;


                if (!component || component.type != "Note" || !component.enabled) {
                    continue;
                }
                let top1 = component.position.top;
                let top2 = component.position.top + component.position.height;

                const y1 = x.event.pageY + (component.position.height / 2);
                const y2 = x.event.pageY;
                const left1 = component.position.left;
                const left2 = component.position.left + component.position.width;



                const x1 = x.event.pageX;
                if (((y1 > top1 && y1 < top2) || (y2 > top1 && y2 < top2))
                    &&
                    (x1 > left1 && left2 > x1)
                ) {
                    // console.log(component.position)
                    //infoHolder.score++;
                    component.touched = true;
                }
            }
        });

        return entities;


    } catch (e) {
        console.error(e);
        throw e;
    }
}