import { Dimensions } from "react-native";
import React, { useEffect, useRef, useState } from 'react';
import { InfoBeholder, INoteTick, IScreen, Note, Position } from "../../../types";
import { calculate, isOverlapping } from "../../../Methods";
import Touches from "./Touches";
import NoteTick from "../NoteTick";
import GlobalState from "../../../objects/GlobalState";
let waiting = false;
export default (entities: any, { touches }: any) => {
    try {
        if (waiting)
            return entities;
        waiting = true;

      
        const deleteEntity = (key: any) => {
            if (entities[key]) {
                delete entities[key];
            }
        }
        const infoHolder = GlobalState.getItem();
    

        if (infoHolder === undefined || infoHolder.file.renderedNotes === undefined)
        {
            console.error("infoHolder cannot be null")
            return entities;
        }
        infoHolder.ticks++;
        const height = infoHolder.windowSize.height;
        const screen = entities.screen as IScreen;
        const positions = {} as any;
        for (const component of infoHolder.file.renderedNotes) {
            if (component.position.top > height) {
                component.enabled = false;
                deleteEntity(component.noteIndex);
                continue;
            }

            calculate(component, component.position, height, infoHolder.file, infoHolder.currentVideoTime);
            if (component.position.top > height) {
                component.enabled = false;
                deleteEntity(component.noteIndex);
                continue;
            }

            if (component.position.top > 0 && component.position.top < height) {
                positions[component.noteIndex] = {
                    ...component.position
                };

            }
        }

        const addedComponents = [] as Position[];
        const posKeys = Object.keys(positions);
        while (posKeys.length > 0) {
            const key = posKeys.shift() as string;
            const component = infoHolder.file.renderedNotes.findAt(parseInt(key.toString())) as Note;
            if (addedComponents.length > 0 && isOverlapping(addedComponents, positions[key])) {
                component.enabled = false;
                deleteEntity(key);
                console.log("overlapping --- 1")
                continue;
            }

            addedComponents.push(component.position)
            if (entities[key] === undefined) {
                entities[key] = {
                    renderer: NoteTick,
                    position: {
                        ...component.position,
                        left: 0.07 * infoHolder.windowSize.width,
                        top: (component.position.top - component.position.height) - 10
                    },
                    note: component,
                    panel: component.panelPosition,
                    enabled: true,
                    type: "Note"
                } as INoteTick
            } else {
                entities[key].position = { ...positions[key], top: positions[key].top }
                entities[key].enabled = true;
                component.enabled = true;
                //validateTouches(key, entities[key]);
            }

        }
        waiting = false

        return entities;
    } catch (e) {
        console.error(e);
        throw e;
    }
}