import { noctuaFormConfig } from './../../noctua-form-config';
import { AnnotonNode, EntityLookup, Predicate, Annoton, Entity, AnnotonType, AnnotonNodeDisplay } from './../../models/annoton';
import * as EntityDefinition from './entity-definition';
import { each } from 'lodash';
import { AnnotonNodeType } from './../../models/annoton/annoton-node';

declare const require: any;
const getUuid = require('uuid/v1');

export interface ActivityDescription {
    type: AnnotonType;
    nodes: { [key: string]: AnnotonNodeDisplay };
    triples: { subject: string, object: string, predicate: any }[];
    overrides?: { [key: string]: AnnotonNodeDisplay };
}

export interface InsertNodeDescription {
    node: AnnotonNodeDisplay;
    predicate: Entity;
}

export const activityUnitDescription: ActivityDescription = {
    type: AnnotonType.default,
    nodes: {
        [AnnotonNodeType.GoMolecularFunction]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoMolecularFunction.id,
            type: AnnotonNodeType.GoMolecularFunction,
            category: EntityDefinition.GoMolecularFunction.category,
            label: 'Molecular Function',
            aspect: 'F',
            relationship: noctuaFormConfig.edge.enabledBy,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.mf,
            termRequired: true
        },
        [AnnotonNodeType.GoMolecularEntity]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoMolecularEntity.id,
            type: AnnotonNodeType.GoMolecularEntity,
            category: EntityDefinition.GoMolecularEntity.category,
            label: 'Gene Product',
            skipEvidence: true,
            relationship: noctuaFormConfig.edge.enabledBy,
            displaySection: noctuaFormConfig.displaySection.gp,
            displayGroup: noctuaFormConfig.displayGroup.gp,
            termRequired: true
        },
        [AnnotonNodeType.GoBiologicalProcess]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoBiologicalProcess.id,
            type: AnnotonNodeType.GoBiologicalProcess,
            category: EntityDefinition.GoBiologicalProcess.category,
            label: 'MF part of Biological Process',
            aspect: 'P',
            relationship: noctuaFormConfig.edge.partOf,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.bp,
            treeLevel: 2,
        },
        [AnnotonNodeType.GoCellularComponent]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoCellularComponent.id,
            type: AnnotonNodeType.GoCellularComponent,
            category: EntityDefinition.GoCellularComponent.category,
            label: 'MF occurs in Cellular Component',
            aspect: 'C',
            relationship: noctuaFormConfig.edge.occursIn,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.cc,
            treeLevel: 2,
        }
    },
    triples: [{
        subject: AnnotonNodeType.GoMolecularFunction,
        object: AnnotonNodeType.GoMolecularEntity,
        predicate: noctuaFormConfig.edge.enabledBy
    }, {
        subject: AnnotonNodeType.GoMolecularFunction,
        object: AnnotonNodeType.GoBiologicalProcess,
        predicate: noctuaFormConfig.edge.partOf
    }, {
        subject: AnnotonNodeType.GoMolecularFunction,
        object: AnnotonNodeType.GoCellularComponent,
        predicate: noctuaFormConfig.edge.occursIn
    }],
};

export const bpOnlyAnnotationDescription: ActivityDescription = {
    type: AnnotonType.bpOnly,
    nodes: {
        [AnnotonNodeType.GoMolecularFunction]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoMolecularFunction.id,
            type: AnnotonNodeType.GoMolecularFunction,
            category: EntityDefinition.GoMolecularFunction.category,
            label: 'Molecular Function',
            aspect: 'F',
            relationship: noctuaFormConfig.edge.enabledBy,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.mf,
            visible: false
        },
        [AnnotonNodeType.GoMolecularEntity]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoMolecularEntity.id,
            type: AnnotonNodeType.GoMolecularEntity,
            category: EntityDefinition.GoMolecularEntity.category,
            label: 'Gene Product',
            skipEvidence: true,
            relationship: noctuaFormConfig.edge.enabledBy,
            displaySection: noctuaFormConfig.displaySection.gp,
            displayGroup: noctuaFormConfig.displayGroup.gp,
            termRequired: true
        },

        [AnnotonNodeType.GoBiologicalProcess]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoBiologicalProcess.id,
            type: AnnotonNodeType.GoBiologicalProcess,
            category: EntityDefinition.GoBiologicalProcess.category,
            label: 'Biological Process',
            aspect: 'P',
            relationship: noctuaFormConfig.edge.causallyUpstreamOfOrWithin,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.bp,
            treeLevel: 2,
            termRequired: true
        },
        [AnnotonNodeType.GoCellularComponent]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoCellularComponent.id,
            type: AnnotonNodeType.GoCellularComponent,
            category: EntityDefinition.GoCellularComponent.category,
            label: 'occurs in Cellular Component',
            aspect: 'C',
            relationship: noctuaFormConfig.edge.occursIn,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.cc,
            treeLevel: 3,
        }
    },
    triples: [{
        subject: AnnotonNodeType.GoMolecularFunction,
        object: AnnotonNodeType.GoMolecularEntity,
        predicate: noctuaFormConfig.edge.enabledBy
    }, {
        subject: AnnotonNodeType.GoMolecularFunction,
        object: AnnotonNodeType.GoBiologicalProcess,
        predicate: noctuaFormConfig.edge.causallyUpstreamOfOrWithin
    }, {
        subject: AnnotonNodeType.GoBiologicalProcess,
        object: AnnotonNodeType.GoCellularComponent,
        predicate: noctuaFormConfig.edge.occursIn
    }],
    overrides: {
        [AnnotonNodeType.GoBiologicalProcess]: <AnnotonNodeDisplay>{
            label: 'Biological Process',
            treeLevel: 2
        },
        [AnnotonNodeType.GoCellularComponent]: <AnnotonNodeDisplay>{
            treeLevel: 3
        }
    }
};

export const ccOnlyAnnotationDescription: ActivityDescription = {
    type: AnnotonType.ccOnly,
    nodes: {
        [AnnotonNodeType.GoMolecularEntity]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoMolecularEntity.id,
            type: AnnotonNodeType.GoMolecularEntity,
            category: EntityDefinition.GoMolecularEntity.category,
            label: 'Gene Product',
            skipEvidence: true,
            relationship: noctuaFormConfig.edge.enabledBy,
            displaySection: noctuaFormConfig.displaySection.gp,
            displayGroup: noctuaFormConfig.displayGroup.gp,
        },
        [AnnotonNodeType.GoCellularComponent]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoCellularComponent.id,
            type: AnnotonNodeType.GoCellularComponent,
            category: EntityDefinition.GoCellularComponent.category,
            aspect: 'C',
            label: 'Located In Cellular Component',
            relationship: noctuaFormConfig.edge.locatedIn,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.cc,
            treeLevel: 2,
        }
    },
    triples: [{
        subject: AnnotonNodeType.GoMolecularEntity,
        object: AnnotonNodeType.GoCellularComponent,
        predicate: noctuaFormConfig.edge.locatedIn
    }],
};

export const insertNodeDescription = {
    [AnnotonNodeType.GoMolecularFunction]: {
        [AnnotonNodeType.GoChemicalEntityHasInput]: <InsertNodeDescription>{
            node: <AnnotonNodeDisplay>{
                category: EntityDefinition.GoChemicalEntity.category,
                label: 'Has Input (GP/Chemical)',
                relationship: noctuaFormConfig.edge.hasInput,
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.mf,
                treeLevel: 2,
                isExtension: true,
            },
            predicate: noctuaFormConfig.edge.hasInput,
        },
        [AnnotonNodeType.GoChemicalEntityHasOutput]: <InsertNodeDescription>{
            node: <AnnotonNodeDisplay>{
                category: EntityDefinition.GoChemicalEntity.category,
                label: 'Has Output (GP/Chemical)',
                relationship: noctuaFormConfig.edge.hasOutput,
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.mf,
                treeLevel: 2,
                isExtension: true,
            },
            predicate: noctuaFormConfig.edge.hasOutput
        },
        [AnnotonNodeType.GoBiologicalPhase]: <InsertNodeDescription>{
            node: <AnnotonNodeDisplay>{
                category: EntityDefinition.GoBiologicalPhase.category,
                label: 'Happens During (Temporal Phase)',
                relationship: noctuaFormConfig.edge.happensDuring,
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.mf,
                treeLevel: 2,
                isExtension: true,
            },
            predicate: noctuaFormConfig.edge.happensDuring
        }
    },
    [AnnotonNodeType.GoBiologicalProcess]: {
        [AnnotonNodeType.GoBiologicalProcess]: <InsertNodeDescription>{
            node: <AnnotonNodeDisplay>{
                category: EntityDefinition.GoBiologicalProcess.category,
                label: 'Part Of (Biological Process)',
                aspect: 'P',
                relationship: noctuaFormConfig.edge.partOf,
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.bp,
                treeLevel: 3,
                isExtension: true,
            },
            predicate: noctuaFormConfig.edge.partOf
        },
    },
    [AnnotonNodeType.GoCellularComponent]: {
        [AnnotonNodeType.GoCellTypeEntity]: <InsertNodeDescription>{
            node: <AnnotonNodeDisplay>{
                category: EntityDefinition.GoCellTypeEntity.category,
                label: 'Part Of (Cell Type)',
                relationship: noctuaFormConfig.edge.partOf,
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                treeLevel: 3,
                isExtension: true,
            },
            predicate: noctuaFormConfig.edge.partOf
        },
        [AnnotonNodeType.GoAnatomicalEntity]: <InsertNodeDescription>{
            node: <AnnotonNodeDisplay>{
                category: EntityDefinition.GoAnatomicalEntity.category,
                label: 'Part Of (Anatomy)',
                relationship: noctuaFormConfig.edge.partOf,
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                treeLevel: 3,
                isExtension: true,
            },
            predicate: noctuaFormConfig.edge.partOf
        },
        [AnnotonNodeType.GoOrganism]: <InsertNodeDescription>{
            node: <AnnotonNodeDisplay>{
                category: EntityDefinition.GoOrganism.category,
                label: 'Part Of (Organism)',
                relationship: noctuaFormConfig.edge.partOf,
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                treeLevel: 3,
                isExtension: true,
            },
            predicate: noctuaFormConfig.edge.partOf
        },
        [AnnotonNodeType.GoCellularComponent]: <InsertNodeDescription>{
            node: <AnnotonNodeDisplay>{
                category: EntityDefinition.GoCellularComponent.category,
                aspect: 'C',
                label: 'Part Of Cellular Component',
                relationship: noctuaFormConfig.edge.locatedIn,
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                treeLevel: 3,
                isExtension: true,
            },
            predicate: noctuaFormConfig.edge.partOf
        }
    },
    [AnnotonNodeType.GoCellTypeEntity]: {
        [AnnotonNodeType.GoAnatomicalEntity]: <InsertNodeDescription>{
            node: <AnnotonNodeDisplay>{
                category: EntityDefinition.GoAnatomicalEntity.category,
                label: 'Part Of (Anatomy)',
                relationship: noctuaFormConfig.edge.partOf,
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                treeLevel: 4,
                isExtension: true,
            },
            predicate: noctuaFormConfig.edge.partOf
        },
        [AnnotonNodeType.GoOrganism]: <InsertNodeDescription>{
            node: <AnnotonNodeDisplay>{
                category: EntityDefinition.GoOrganism.category,
                label: 'Part Of (Organism)',
                relationship: noctuaFormConfig.edge.partOf,
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                treeLevel: 4,
                isExtension: true,
            },
            predicate: noctuaFormConfig.edge.partOf
        }
    },
    [AnnotonNodeType.GoAnatomicalEntity]: {
        [AnnotonNodeType.GoOrganism]: <InsertNodeDescription>{
            node: <AnnotonNodeDisplay>{
                category: EntityDefinition.GoOrganism.category,
                label: 'Part Of (Organism)',
                relationship: noctuaFormConfig.edge.partOf,
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                treeLevel: 5,
                isExtension: true,
            },
            predicate: noctuaFormConfig.edge.partOf
        }
    }
};

export const entityMenuItems = {
    [AnnotonNodeType.GoMolecularFunction]: [{
        label: 'Add Has Input (GP/Chemical)',
        id: AnnotonNodeType.GoChemicalEntityHasInput
    }, {
        label: 'Add Has Output (GP/Chemical)',
        id: AnnotonNodeType.GoChemicalEntityHasOutput
    }, {
        label: 'Add Happens During (Biological Phase)',
        id: AnnotonNodeType.GoBiologicalPhase
    }],
    [AnnotonNodeType.GoBiologicalProcess]: [{
        label: 'Add Part Of (Biological Process)',
        id: AnnotonNodeType.GoBiologicalProcess
    }],
    [AnnotonNodeType.GoCellularComponent]: [{
        label: 'Add Part Of (Cellular Component)',
        id: AnnotonNodeType.GoCellularComponent
    }, {
        label: 'Add Part Of (Cell Type)',
        id: AnnotonNodeType.GoCellTypeEntity
    }, {
        label: 'Add Part Of (Anatomy)',
        id: AnnotonNodeType.GoAnatomicalEntity
    }, {
        label: 'Add Part Of (Organism)',
        id: AnnotonNodeType.GoOrganism
    }],
    [AnnotonNodeType.GoCellTypeEntity]: [{
        label: 'Add Part Of (Anatomy)',
        id: AnnotonNodeType.GoAnatomicalEntity
    }, {
        label: 'Add Part Of (Organism)',
        id: AnnotonNodeType.GoOrganism
    }],
    [AnnotonNodeType.GoAnatomicalEntity]: [{
        label: 'Add Part Of (Organism)',
        id: AnnotonNodeType.GoOrganism
    }]
};

export const createActivity = (activityDescription: ActivityDescription): Annoton => {
    const self = this;
    const annoton = new Annoton();

    annoton.annotonType = activityDescription.type;

    each(activityDescription.nodes, (node: AnnotonNodeDisplay) => {
        const annotonNode = EntityDefinition.generateBaseTerm(node.category, node);
        annoton.addNode(annotonNode);
    });

    each(activityDescription.triples, (triple) => {
        const predicate: Predicate = annoton.getNode(triple.object).predicate;

        predicate.edge = Entity.createEntity(triple.predicate);
        annoton.addEdgeById(triple.subject, triple.object, predicate);
    });

    const startNode = annoton.getNode(activityDescription.triples[0].subject);
    const startTriple = annoton.getEdge(
        activityDescription.triples[0].subject,
        activityDescription.triples[0].object);

    startNode.predicate = startTriple.predicate;

    annoton.enableSubmit();
    return annoton;
};

export const insertNode = (annoton: Annoton, subjectNode: AnnotonNode, nodeType: AnnotonNodeType): AnnotonNode => {
    const nodeDescription: InsertNodeDescription = insertNodeDescription[subjectNode.type][nodeType];
    const objectNode = EntityDefinition.generateBaseTerm(nodeDescription.node.category, nodeDescription.node);

    objectNode.id = `${nodeType}'@@'${getUuid()}`;
    objectNode.type = nodeType;

    annoton.addNode(objectNode);

    const predicate: Predicate = annoton.getNode(objectNode.id).predicate;
    predicate.edge = Entity.createEntity(nodeDescription.predicate);
    annoton.addEdgeById(subjectNode.id, objectNode.id, predicate);

    annoton.resetPresentation();

    return objectNode;
};

export const checkNode = (annoton: Annoton, subjectNode: AnnotonNode, nodeType: AnnotonNodeType): AnnotonNode => {
    const nodeDescription: InsertNodeDescription = insertNodeDescription[subjectNode.type][nodeType];
    const objectNode = EntityDefinition.generateBaseTerm(nodeDescription.node.category, nodeDescription.node);

    const edges = annoton.getEdges(subjectNode.id);

    each(insertNodeDescription[subjectNode.type], (desc: InsertNodeDescription) => {

    });


    objectNode.id = `${nodeType}'@@'${getUuid()}`;
    objectNode.type = nodeType;

    annoton.addNode(objectNode);

    const predicate: Predicate = annoton.getNode(objectNode.id).predicate;
    predicate.edge = Entity.createEntity(nodeDescription.predicate);
    annoton.addEdgeById(subjectNode.id, objectNode.id, predicate);

    annoton.resetPresentation();

    return objectNode;
};
