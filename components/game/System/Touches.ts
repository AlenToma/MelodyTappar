import { Dimensions } from "react-native";
import React, { useEffect, useRef, useState } from 'react';
import { InfoBeholder, INoteTick, IScreen, PanelPosition, Position } from "../../../types";
import { isOverlapping } from "../../../Methods";
import { TouchEvent } from "react-native-game-engine"
import GlobalState from "../../../objects/GlobalState";

export default (entities: any, { touches }: { touches: TouchEvent[] }) => {
    try {
        const screen = entities.screen as IScreen;

        const infoHolder = GlobalState.getItem();

        if (infoHolder.ticks % 10 == 0)
            screen.glowLines = [];

        if (infoHolder === undefined || infoHolder.file.renderedNotes === undefined) {
            console.error("infoHolder cannot be null")
            return entities;
        }
        const bottom = (infoHolder.windowSize.height - infoHolder.windowSize.panelBottomHeight);
        const keys = Object.keys(entities);
        const isTouched = (component: INoteTick, x: number, y: number) => {
            if (component.position.noteCalculatedTick) {
                let speed =
                    (((component.position.top) /
                        component.position.noteCalculatedTick.bpm) *
                        component.position.noteCalculatedTick.timer)

                let top = component.position.top;
                let topBottom = top + component.position.height;

                let tTop = component.position.top - speed;

                const left = component.position.left;
                const right = component.position.left + component.position.width;

                if (((y >= top && y <= topBottom) || (y >= tTop && y <= topBottom + speed))
                    &&
                    (x >= left && x <= right)
                ) {
                    return true;
                }
            }
            return false;
        }
        touches = touches.filter((x: any) => (x.type === "press" || x.type === "end" || x.type == "start") && !x.handled)
        touches.forEach(x => {
            try {
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
                        screen.glowLines = [...screen.glowLines, component.position.panelType as PanelPosition];
                    }

                }
            } catch (e) {
                console.error(e);
            }
        });


        return entities;


    } catch (e) {
        console.error(e);
        throw e;
    }
}