import { Dimensions } from "react-native";
import React, { useEffect, useRef, useState } from 'react';
import { InfoBeholder, INoteTick, IScreen, Position } from "../../../types";
import { calculate, isOverlapping } from "../../../Methods";
import { TouchEvent } from "react-native-game-engine"
import GlobalState from "../../../objects/GlobalState";

export default (entities: any, { touches }: { touches: TouchEvent[] }) => {
    try {
        const infoHolder = GlobalState.getItem();
        if (infoHolder === undefined || infoHolder.file.renderedNotes === undefined)
            {
                console.error("infoHolder cannot be null")
                return entities;
            }
        const bottom = infoHolder.windowSize.height - (0.2 * infoHolder.windowSize.height);
        const keys = Object.keys(entities);
        const isTouched = (component: INoteTick, x: number, y: number) => {
            let top = component.position.top - (bottom);
            let topBottom = top + (component.position.height +(bottom ));

            const left = component.position.left;
            const right = component.position.left + component.position.width;

            //const y2 = y -  (component.position.height / 2);

            if (((y >= top && y <= topBottom))
                &&
                (x >= left && x <= right)
            ) {
                return true;
            }
            return false;
        }
        touches = touches.filter((x: any) => (x.type === "press" || x.type === "end" || x.type == "start") && !x.handled)
        touches.forEach(x => {
            const xAny = x as any;
            for (const key of keys) {
                const component = entities[key] as INoteTick;


                if (!component ||
                    component.type != "Note"
                    || !component.enabled
                    || xAny.handled ||
                    component.touched ||
                    component.position.top + component.position.height < bottom) {
                    continue;
                }
                if (isTouched(component, x.event.locationX, x.event.locationY)
                    ||
                    isTouched(component, x.event.pageX, x.event.pageY)) {
                    infoHolder.score++;
                    component.touched = true;
                    xAny.handled = true;
                }

            }
        });


        return entities;


    } catch (e) {
        console.error(e);
        throw e;
    }
}