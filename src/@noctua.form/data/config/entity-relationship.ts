import { noctuaFormConfig } from './../../noctua-form-config';


export const activityUnit = {
    nodes: [
        'mf', 'gp', 'mf-1', 'mf-2', 'bp', 'bp-1', 'bp-1-1', 'cc', 'cc-1', 'cc-1-1', 'cc-1-1-1'
    ],
    triples: [{
        subject: 'mf',
        object: 'gp',
        edge: noctuaFormConfig.edge.enabledBy
    }, {
        subject: 'mf',
        object: 'bp',
        edge: noctuaFormConfig.edge.partOf
    }, {
        subject: 'mf',
        object: 'cc',
        edge: noctuaFormConfig.edge.occursIn
    }, {
        subject: 'mf',
        object: 'mf-1',
        edge: noctuaFormConfig.edge.hasInput
    }, {
        subject: 'mf',
        object: 'mf-2',
        edge: noctuaFormConfig.edge.happensDuring
    }, {
        subject: 'bp',
        object: 'bp-1',
        edge: noctuaFormConfig.edge.partOf
    }, {
        subject: 'bp-1',
        object: 'bp-1-1',
        edge: noctuaFormConfig.edge.partOf
    }, {
        subject: 'cc',
        object: 'cc-1',
        edge: noctuaFormConfig.edge.partOf
    }, {
        subject: 'cc-1',
        object: 'cc-1-1',
        edge: noctuaFormConfig.edge.partOf
    }, {
        subject: 'cc-1-1',
        object: 'cc-1-1-1',
        edge: noctuaFormConfig.edge.partOf
    }],
};

export const ccAnnotation = {
    nodes: [
        'gp', 'cc', 'cc-1', 'cc-1-1', 'cc-1-1-1'
    ],
    overrides: {
        'cc': {
            id: 'cc',
            label: 'GP located in Cellular Component',
            relationship: noctuaFormConfig.edge.locatedIn
        },
        'cc-1': {
            id: 'cc-1',
            relationship: noctuaFormConfig.edge.partOf
        },
        'cc-1-1': {
            id: 'cc-1-1',
            relationship: noctuaFormConfig.edge.partOf,
            treeLevel: 4
        }
    },
    triples: [{
        subject: 'gp',
        object: 'cc',
        edge: noctuaFormConfig.edge.locatedIn
    }, {
        subject: 'cc',
        object: 'cc-1',
        edge: noctuaFormConfig.edge.partOf
    }, {
        subject: 'cc-1',
        object: 'cc-1-1',
        edge: noctuaFormConfig.edge.partOf,
    }, {
        subject: 'cc-1-1',
        object: 'cc-1-1-1',
        edge: noctuaFormConfig.edge.partOf
    }]
};

export const bpAnnotation = {
    nodes: [
        'mf', 'gp', 'bp', 'cc-1-1', 'cc-1-1-1'
    ],
    overrides: {
        mf: {
            termRequiredList: [],
            id: 'mf',
            display: {
                displaySection: '',
                displayGroup: '',
            },
        },
        'bp': {
            id: 'bp',
            label: 'Biological Process',
        },
        'cc-1-1': {
            id: 'cc-1-1',
            label: 'occurs in (Cell Type)',
            relationship: noctuaFormConfig.edge.occursIn,
            display: {
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.bp,
            },
            treeLevel: 3
        },
        'cc-1-1-1': {
            id: 'cc-1-1-1',
            relationship: noctuaFormConfig.edge.partOf,
            display: {
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.bp,
            },
            label: 'part Of (Anatomy)',
            treeLevel: 4
        },
    },
    triples: [{
        subject: 'mf',
        object: 'gp',
        edge: noctuaFormConfig.edge.enabledBy
    }, {
        subject: 'bp',
        object: 'cc-1-1',
        edge: noctuaFormConfig.edge.occursIn
    }, {
        subject: 'cc-1-1',
        object: 'cc-1-1-1',
        edge: noctuaFormConfig.edge.partOf
    }, {
        subject: 'mf',
        object: 'bp',
        edge: noctuaFormConfig.edge.causallyUpstreamOfOrWithin,
        edgeOption: {
            selected: noctuaFormConfig.edge.causallyUpstreamOfOrWithin,
            options: [
                noctuaFormConfig.edge.causallyUpstreamOfOrWithin,
                noctuaFormConfig.edge.causallyUpstreamOf,
                noctuaFormConfig.edge.causallyUpstreamOfPositiveEffect,
                noctuaFormConfig.edge.causallyUpstreamOfNegativeEffect,
                noctuaFormConfig.edge.causallyUpstreamOfOrWithinPositiveEffect,
                noctuaFormConfig.edge.causallyUpstreamOfOrWithinNegativeEffect,
            ]
        }
    }]
};

