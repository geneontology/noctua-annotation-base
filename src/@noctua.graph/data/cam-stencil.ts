import { ActivityType, noctuaFormConfig } from '@geneontology/noctua-form-base';
import { cloneDeep } from "lodash";

export interface StencilItemNode {
    id: string;
    label: string;
    type: ActivityType,
    iconUrl: string
}

export interface StencilItem {
    id: string;
    label: string;
    nodes: StencilItemNode[],
}


const camStencil: StencilItem[] = [{
    id: 'activity_unit',
    label: 'Activity Type',
    nodes: [{
        type: ActivityType.default,
        id: noctuaFormConfig.activityType.options.default.name,
        label: noctuaFormConfig.activityType.options.default.label.toUpperCase(),
        iconUrl: './assets/images/activity/default.png'
    }, {
        type: ActivityType.proteinComplex,
        id: noctuaFormConfig.activityType.options.proteinComplex.name,
        label: noctuaFormConfig.activityType.options.proteinComplex.label.toUpperCase(),
        iconUrl: './assets/images/activity/proteinComplex.png'
    }, {
        type: ActivityType.molecule,
        id: noctuaFormConfig.activityType.options.molecule.name,
        label: noctuaFormConfig.activityType.options.molecule.label.toUpperCase(),
        iconUrl: './assets/images/activity/molecule.png'
    }]
}]

export const noctuaStencil = {
    camStencil: cloneDeep(camStencil)
};

