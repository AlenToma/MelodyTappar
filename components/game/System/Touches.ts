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

        if (infoHolder === undefined || infoHolder.file.renderedNotes === undefined) {
            console.error("infoHolder cannot be null")
            return entities;
        }

        const keys = Object.keys(entities);
        const isTouched = (component: INoteTick, x: number, y: number) => {
            if (component.position.noteCalculatedTick) {
                let speed =
                    (((component.position.top) /
                        component.position.noteCalculatedTick.bpm) *
                        component.position.noteCalculatedTick.timer)

                let top = component.position.top;
                let topBottom = top + (component.note.file.windowPropeties.panelBottomHeight / 2);

                let tTop = component.position.top - speed;

                const left = component.position.left;
                const right = component.position.left + (component.note.file.windowPropeties.panelBottomHeight / 2);

                if (((y >= top && y <= topBottom) || (y >= tTop && y <= topBottom + speed))
                    &&
                    (x >= left && x <= right)
                ) {
                    return true;
                }
            }
            return false;
        }
        const controlledNotes = {} as any;
        touches.filter((x: any) => (x.type == "start" || x.type == "end") && !x.handled).forEach(x => {
            try {
                const xAny = x as any;
                for (const key of keys) {
                    const component = entities[key] as INoteTick;
                    if (!component ||
                        component.type != "Note"
                        || !component.enabled
                        || xAny.handled ||
                        component.position.top + component.position.height < component.note.getBottom()) {
                        if (component.note && screen.glowLines.includes(component.note.noteIndex))
                            screen.glowLines = [...screen.glowLines.filter(f => f !== component.note.noteIndex)]
                        continue;
                    }
                    if (isTouched(component, x.event.locationX, x.event.locationY)
                        ||
                        isTouched(component, x.event.pageX, x.event.pageY)) {
                        if (!component.note.touchHandled)
                            infoHolder.score += component.note.addScore();
                        if (component.note.touchHandled && x.type == "start")
                            continue;
                        component.touched = x.type == "start";
                        if (x.type == "start" && !component.note.touchHandled) {
                            component.note.touchHandled = true;
                            screen.glowLines = [...screen.glowLines, component.note.noteIndex];
                        } else screen.glowLines = [...screen.glowLines.filter(f => f !== component.note.noteIndex)]
                        xAny.handled = true;
                        controlledNotes[key] = true;

                    }
                }
            } catch (e) {
                console.error(e);
            }
        });

        touches.filter((x: any) => (x.type == "move")).forEach(x => {
            try {
                const xAny = x as any;
                for (const key of keys) {
                    const component = entities[key] as INoteTick;
                    if (!component ||
                        component.type != "Note"
                        || !component.enabled
                        || xAny.handled ||
                        component.position.top + component.position.height < component.note.getBottom()) {
                        if (component.note && screen.glowLines.includes(component.note.noteIndex))
                            screen.glowLines = [...screen.glowLines.filter(f => f !== component.note.noteIndex)]
                        continue;
                    }
                    if (isTouched(component, x.event.locationX, x.event.locationY)
                        ||
                        isTouched(component, x.event.pageX, x.event.pageY)) {
                        if (component.touched && !controlledNotes[key])
                            infoHolder.score += component.note.addScore();
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