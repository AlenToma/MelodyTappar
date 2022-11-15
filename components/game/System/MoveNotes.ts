import { Dimensions } from "react-native";
import React, { useEffect, useRef, useState } from 'react';
import { InfoBeholder, INoteTick, IScreen, Position } from "../../../types";
import { calculate, isOverlapping } from "../../../Methods";
import Touches from "./Touches";

export default (entities: any, { touches }: any) => {
    try {
       const validateTouches=(key: any, component:INoteTick )=> {
        const en ={} as any;
        en[key] = component; 
        en.infoHolder = infoHolder; 
        Touches(en, {touches})
       }
        const infoHolder = entities.infoHolder as InfoBeholder;
        if (infoHolder === undefined)
            console.error("infoHolder cannot be null")
        infoHolder.ticks++;
        const height = infoHolder.windowSize.height;
        const screen = entities.screen;
        const keys = Object.keys(entities);
        const positions = {} as any;
        for (const key of keys) {
            const component = entities[key] as INoteTick;

            if (component.type != "Note") {
                continue;
            }
            validateTouches(key, component);
            if (component.position.top > height) {
                component.enabled = false;
                delete entities[key];
                continue;
            }

            calculate(component.note, component.position, height, infoHolder.file, infoHolder.currentVideoTime);
            if (component.position.top > height) {
                component.enabled = false;
                delete entities[key];
                continue;
            }

            if (component.position.top > 0 && component.position.top < height) {
                positions[key] = {
                    ...component.position,
                    panelType: component.panel
                };

            }
        }

        const addedComponents = [] as Position[];
        const posKeys = Object.keys(positions);
        while (posKeys.length>0) {
            const key = posKeys.shift() as string;
            const component = entities[key] as INoteTick;
            positions[key].panelType = component.panel;
            if (addedComponents.length > 0 && isOverlapping(addedComponents, positions[key])) {
                component.enabled = false;
                component.overlaping = true;
                console.log("overlapping --- 1")
                continue;
            }
            component.position = { ...positions[key], top: positions[key].top }
            component.enabled = true;
            addedComponents.push(component.position)
            validateTouches(key, component);
        }
       
        if (screen) {

        }
        return entities;
    } catch (e) {
        console.error(e);
        throw e;
    }
}