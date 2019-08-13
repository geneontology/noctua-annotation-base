import { noctuaFormConfig } from './../../noctua-form-config';
import { AnnotonNode, EntityLookup, Predicate, Annoton } from './../../models/annoton';
import * as EntityDefinition from './entity-definition';




const modelRelationship = {
    default: {
        nodes: [
            'mf', 'gp', '', 'mf-2', 'bp', 'bp-1', 'bp-1-1', 'cc', 'cc-1', 'cc-1-1', 'cc-1-1-1'
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
    },
    ccOnly: {
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
    },
    bpOnly: {
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
    },
    connector: {
        nodes: [
            'mf', 'mf'
        ],
        overrides: {
            mf: {
                termRequiredList: [],
                id: 'mf',
                display: {
                    displaySection: '',
                    displayGroup: '',
                }
            }
        },
        triples: [{
            subject: 'mf',
            object: 'mf',
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
        }],
    },
};


export const createAnnotonModel = (modelType, srcAnnoton?): Annoton => {
    const annoton = new Annoton();

    const gp = EntityDefinition.generateGeneProduct();


    annoton.addNode();


    each(modelIds[modelType].nodes, function (id) {
        const annotonNode = self.generateAnnotonNode(id);
        annoton.addNode(annotonNode);
    });

    each(modelIds[modelType].triples, function (triple) {
        const predicate = annoton.getNode(triple.object).predicate;

        predicate.edge = triple.edge;
        annoton.addEdgeById(triple.subject, triple.object, predicate);
    });

    const startNode = annoton.getNode(modelIds[modelType].nodes[0]);
    const startTriple = annoton.getEdge(modelIds[modelType].triples[0].subject, modelIds[modelType].triples[0].object);

    startNode.predicate = startTriple.predicate;

    if (srcAnnoton) {
        // annoton.copyValues(srcAnnoton);
    }

    each(modelIds[modelType].overrides, function (overridesData) {
        const node: AnnotonNode = annoton.getNode(overridesData.id);

        overridesData.isExtension ? node.isExtension = overridesData.isExtension : null;
        overridesData.treeLevel ? node.treeLevel = overridesData.treeLevel : null;
        overridesData.termRequiredList ? node.termRequiredList = overridesData.termRequiredList : null;
        overridesData.term ? node.term = overridesData.term : null;
        overridesData.display ? node.setDisplay(overridesData.display) : null;
        overridesData.label ? node.label = overridesData.label : null;
        overridesData.relationship ? node.relationship = overridesData.relationship : null;
    });

    annoton.enableSubmit();
    return annoton;
}



createAnnotonModel(modelType, srcAnnoton ?): Annoton {
    const self = this;
    const annoton = new Annoton();
    const modelIds = _.cloneDeep(self._modelRelationship);

    annoton.setAnnotonType(modelType);

    each(modelIds[modelType].nodes, function (id) {
        const annotonNode = self.generateAnnotonNode(id);
        annoton.addNode(annotonNode);
    });

    each(modelIds[modelType].triples, function (triple) {
        const predicate = annoton.getNode(triple.object).predicate;

        predicate.edge = triple.edge;
        annoton.addEdgeById(triple.subject, triple.object, predicate);
    });

    const startNode = annoton.getNode(modelIds[modelType].nodes[0]);
    const startTriple = annoton.getEdge(modelIds[modelType].triples[0].subject, modelIds[modelType].triples[0].object);

    startNode.predicate = startTriple.predicate;

    if (srcAnnoton) {
        // annoton.copyValues(srcAnnoton);
    }

    each(modelIds[modelType].overrides, function (overridesData) {
        const node: AnnotonNode = annoton.getNode(overridesData.id);

        overridesData.isExtension ? node.isExtension = overridesData.isExtension : null;
        overridesData.treeLevel ? node.treeLevel = overridesData.treeLevel : null;
        overridesData.termRequiredList ? node.termRequiredList = overridesData.termRequiredList : null;
        overridesData.term ? node.term = overridesData.term : null;
        overridesData.display ? node.setDisplay(overridesData.display) : null;
        overridesData.label ? node.label = overridesData.label : null;
        overridesData.relationship ? node.relationship = overridesData.relationship : null;
    });

    annoton.enableSubmit();
    return annoton;
}