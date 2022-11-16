import { Dimensions } from "react-native";
import React, { useEffect, useRef, useState } from 'react';
import { InfoBeholder, INoteTick, IScreen, INote, Position } from "../../../types";
import { isOverlapping } from "../../../Methods";
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
            if (entities[key] !== undefined) {
                delete entities[key];
            }
        }
        const infoHolder = GlobalState.getItem();


        if (infoHolder === undefined || infoHolder.file.renderedNotes === undefined) {
            console.error("infoHolder cannot be null")
            return entities;
        }
        infoHolder.ticks++;
        const height = infoHolder.windowSize.height;
        const screen = entities.screen as IScreen;
        const positions = {} as any;
        for (const component of infoHolder.file.renderedNotes) {
            if (component.isOutOfRange()) {
                component.enabled = false;
                deleteEntity(component.noteIndex);
                continue;
            }
            const position = component.tick(infoHolder.currentVideoTime);
            if (component.isOutOfRange()) {
                deleteEntity(component.noteIndex);
                continue;
            }

            if (position.top > 0 && position.top < height * 60) {
                positions[component.noteIndex] = {
                    ...component.position
                };

            }
        }

        const addedComponents = [] as Position[];
        const posKeys = Object.keys(positions);
        while (posKeys.length > 0) {
            const key = posKeys.shift() as string;
            const component = infoHolder.file.renderedNotes.findAt(parseInt(key.toString())) as INote;
            if (addedComponents.length > 0 && isOverlapping(addedComponents, positions[key])) {
                component.enabled = false;
                console.log("overlapping --- 1")
                continue;
            }

            addedComponents.push(component.position)
            if (!entities[key]) {
                entities[key] = {
                    renderer: NoteTick,
                    position: {
                        ...positions[key],
                        top: (component.position.top - component.position.height) - 10
                    },
                    note: component,
                    enabled: true,
                    type: "Note"
                };
            } else {
                const item = entities[key];
                if (item) {
                    item.position = { ...positions[key], top: positions[key].top }
                    item.enabled = true;
                    component.enabled = true;
                }
            }

        }
        waiting = false

        return entities;
    } catch (e) {
        console.error(e);
        throw e;
    }
}