import { Dimensions } from "react-native";
import React, { useEffect, useRef, useState } from 'react';
import { InfoBeholder, INoteTick, IScreen, INote, Position } from "../../../types";
import { isOverlapping } from "../../../Methods";
import Touches from "./Touches";
import NoteTick from "../NoteTick";
import GlobalState from "../../../objects/GlobalState";
export default (entities: any, { touches, time }: any) => {
    try {

    /*    if (Object.keys(entities).length > 20)
            console.log("Wow to much data")*/
        const screen = entities.screen as IScreen;
        const deleteEntity = (key: any) => {
            if (entities[key] !== undefined) {
                entities[key].enabled = false;
                delete entities[key];
            }
        }

        const isOutOfRange = (note: INote) => {
            const r = note.isOutOfRange();
            if (r && screen.glowLines.includes(note.noteIndex))
                screen.glowLines = [...screen.glowLines.filter(f => f !== note.noteIndex)]
            return r;
        }
        const infoHolder = GlobalState.getItem();

        if (infoHolder === undefined || infoHolder.file.renderedNotes === undefined) {
            console.error("infoHolder cannot be null")
            return entities;
        }
        infoHolder.ticks++;
        const height = infoHolder.windowSize.height;


        for (const component of infoHolder.file.renderedNotes) {
            if (isOutOfRange(component)) {
                component.enabled = false;
                deleteEntity(component.noteIndex);
                continue;
            }
            const position = component.tick(infoHolder.currentVideoTime, infoHolder.timeInitiated, time);
            if (isOutOfRange(component) || !component.addToScreen()) {
                deleteEntity(component.noteIndex);
                continue;
            }

            if (entities[component.noteIndex] === undefined) {
                entities[component.noteIndex] = {
                    renderer: NoteTick,
                    note: component,
                    type: "Note",
                    position: position,
                    enabled: true
                };
            } else {
                entities[component.noteIndex].position = { ...position }
                entities[component.noteIndex].enabled = true;
            }
        }
        /*
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
        }*/
        return entities;
    } catch (e) {
        console.error(e);
        throw e;
    }
}