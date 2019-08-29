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
    triples: { subject: string, object: string, predicate: any }[];
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
        },
        [AnnotonNodeType.GoCellTypeEntity]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoCellTypeEntity.id,
            type: AnnotonNodeType.GoCellTypeEntity,
            category: EntityDefinition.GoCellTypeEntity.category,
            label: 'Part Of (Cell Type)',
            relationship: noctuaFormConfig.edge.partOf,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.cc,
            treeLevel: 3,
            isExtension: true,
        },
        [AnnotonNodeType.GoAnatomicalEntity]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoAnatomicalEntity.id,
            type: AnnotonNodeType.GoAnatomicalEntity,
            category: EntityDefinition.GoAnatomicalEntity.category,
            label: 'Part Of (Anatomy)',
            relationship: noctuaFormConfig.edge.partOf,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.cc,
            treeLevel: 4,
            isExtension: true,
        },
        [AnnotonNodeType.GoOrganism]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoOrganism.id,
            type: AnnotonNodeType.GoOrganism,
            category: EntityDefinition.GoOrganism.category,
            label: 'Part Of (Organism)',
            relationship: noctuaFormConfig.edge.partOf,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.cc,
            treeLevel: 5,
            isExtension: true,
        },
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
    }, {
        subject: AnnotonNodeType.GoCellularComponent,
        object: AnnotonNodeType.GoCellTypeEntity,
        predicate: noctuaFormConfig.edge.partOf
    }, {
        subject: AnnotonNodeType.GoCellTypeEntity,
        object: AnnotonNodeType.GoAnatomicalEntity,
        predicate: noctuaFormConfig.edge.partOf
    }, {
        subject: AnnotonNodeType.GoAnatomicalEntity,
        object: AnnotonNodeType.GoOrganism,
        predicate: noctuaFormConfig.edge.partOf
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
            displaySection: '',
            displayGroup: '',
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
        },
        [AnnotonNodeType.GoCellTypeEntity]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoCellTypeEntity.id,
            type: AnnotonNodeType.GoCellTypeEntity,
            category: EntityDefinition.GoCellTypeEntity.category,
            label: 'occurs in (Cell Type)',
            relationship: noctuaFormConfig.edge.occursIn,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.cc,
            treeLevel: 3,
            isExtension: true,
        },
        [AnnotonNodeType.GoAnatomicalEntity]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoAnatomicalEntity.id,
            type: AnnotonNodeType.GoAnatomicalEntity,
            category: EntityDefinition.GoAnatomicalEntity.category,
            label: 'Part Of (Anatomy)',
            relationship: noctuaFormConfig.edge.partOf,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.cc,
            treeLevel: 4,
            isExtension: true,
        },
        [AnnotonNodeType.GoOrganism]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoOrganism.id,
            type: AnnotonNodeType.GoOrganism,
            category: EntityDefinition.GoOrganism.category,
            label: 'Part Of (Organism)',
            relationship: noctuaFormConfig.edge.partOf,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.cc,
            treeLevel: 5,
            isExtension: true,
        },
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
        object: AnnotonNodeType.GoCellTypeEntity,
        predicate: noctuaFormConfig.edge.occursIn
    }, {
        subject: AnnotonNodeType.GoCellTypeEntity,
        object: AnnotonNodeType.GoAnatomicalEntity,
        predicate: noctuaFormConfig.edge.partOf
    }, {
        subject: AnnotonNodeType.GoAnatomicalEntity,
        object: AnnotonNodeType.GoOrganism,
        predicate: noctuaFormConfig.edge.partOf
    }],
    overrides: {
        [AnnotonNodeType.GoMolecularFunction]: <AnnotonNodeDisplay>{
            displaySection: '',
            displayGroup: '',
        },
        [AnnotonNodeType.GoBiologicalProcess]: <AnnotonNodeDisplay>{
            label: 'Biological Process',
            treeLevel: 2
        },
        [AnnotonNodeType.GoCellTypeEntity]: <AnnotonNodeDisplay>{
            label: 'occurs in (Cell Type)',
            relationship: noctuaFormConfig.edge.occursIn,
            treeLevel: 3
        },
        [AnnotonNodeType.GoAnatomicalEntity]: <AnnotonNodeDisplay>{
            treeLevel: 4
        },
        [AnnotonNodeType.GoOrganism]: <AnnotonNodeDisplay>{
            treeLevel: 5
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
            label: 'GP located in Cellular Component',
            relationship: noctuaFormConfig.edge.locatedIn,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.cc,
            treeLevel: 2,
        },
        [AnnotonNodeType.GoCellTypeEntity]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoCellTypeEntity.id,
            type: AnnotonNodeType.GoCellTypeEntity,
            category: EntityDefinition.GoCellTypeEntity.category,
            label: 'Part Of (Cell Type)',
            relationship: noctuaFormConfig.edge.partOf,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.cc,
            treeLevel: 3,
            isExtension: true,
        },
        [AnnotonNodeType.GoAnatomicalEntity]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoAnatomicalEntity.id,
            type: AnnotonNodeType.GoAnatomicalEntity,
            category: EntityDefinition.GoAnatomicalEntity.category,
            label: 'Part Of (Anatomy)',
            relationship: noctuaFormConfig.edge.partOf,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.cc,
            treeLevel: 4,
            isExtension: true,
        },
        [AnnotonNodeType.GoOrganism]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoOrganism.id,
            type: AnnotonNodeType.GoOrganism,
            category: EntityDefinition.GoOrganism.category,
            label: 'Part Of (Organism)',
            relationship: noctuaFormConfig.edge.partOf,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.cc,
            treeLevel: 5,
            isExtension: true,
        },
    },
    triples: [{
        subject: AnnotonNodeType.GoMolecularEntity,
        object: AnnotonNodeType.GoCellularComponent,
        predicate: noctuaFormConfig.edge.locatedIn
    }, {
        subject: AnnotonNodeType.GoCellularComponent,
        object: AnnotonNodeType.GoCellTypeEntity,
        predicate: noctuaFormConfig.edge.partOf
    }, {
        subject: AnnotonNodeType.GoCellTypeEntity,
        object: AnnotonNodeType.GoAnatomicalEntity,
        predicate: noctuaFormConfig.edge.partOf
    }, {
        subject: AnnotonNodeType.GoAnatomicalEntity,
        object: AnnotonNodeType.GoOrganism,
        predicate: noctuaFormConfig.edge.partOf
    }],
};

export const insertNodeDescription = {
    [AnnotonNodeType.GoMolecularFunction]: {
        [AnnotonNodeType.GoChemicalEntityHasInput]: <InsertNodeDescription>{
            node: <AnnotonNodeDisplay>{
                id: EntityDefinition.GoChemicalEntity.id,
                category: EntityDefinition.GoChemicalEntity.category,
                label: 'Has Input (Gene Product/Chemical)',
                relationship: noctuaFormConfig.edge.hasInput,
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.mf,
                treeLevel: 2,
                isExtension: true,
            },
            triples: [{
                subject: AnnotonNodeType.GoMolecularFunction,
                object: null,
                predicate: noctuaFormConfig.edge.hasInput
            }],
        },
        [AnnotonNodeType.GoChemicalEntityHasOutput]: <InsertNodeDescription>{
            node: <AnnotonNodeDisplay>{
                id: EntityDefinition.GoChemicalEntity.id,
                category: EntityDefinition.GoChemicalEntity.category,
                label: 'Has Output (Gene Product/Chemical)',
                relationship: noctuaFormConfig.edge.hasOutput,
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.mf,
                treeLevel: 2,
                isExtension: true,
            },
            triples: [{
                subject: AnnotonNodeType.GoMolecularFunction,
                object: null,
                predicate: noctuaFormConfig.edge.hasOutput
            }],
        },
        [AnnotonNodeType.GoBiologicalPhase]: <InsertNodeDescription>{
            node: <AnnotonNodeDisplay>{
                id: EntityDefinition.GoBiologicalPhase.id,
                category: EntityDefinition.GoBiologicalPhase.category,
                label: 'Happens During (Temporal Phase)',
                relationship: noctuaFormConfig.edge.happensDuring,
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.mf,
                treeLevel: 2,
                isExtension: true,
            },
            triples: [{
                subject: AnnotonNodeType.GoMolecularFunction,
                object: null,
                predicate: noctuaFormConfig.edge.happensDuring
            }]
        }
    },
    [AnnotonNodeType.GoBiologicalProcess]: {
        [AnnotonNodeType.GoBiologicalProcess]: <InsertNodeDescription>{
            node: <AnnotonNodeDisplay>{
                id: EntityDefinition.GoBiologicalProcess.id,
                type: AnnotonNodeType.GoBiologicalProcess,
                category: EntityDefinition.GoBiologicalProcess.category,
                label: 'Part Of (Biological Process)',
                aspect: 'P',
                relationship: noctuaFormConfig.edge.partOf,
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.bp,
                treeLevel: 3,
                isExtension: true,
            },
            triples: [{
                subject: AnnotonNodeType.GoBiologicalProcess,
                object: null,
                predicate: noctuaFormConfig.edge.partOf
            }],
        },
    }
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

export const insertNode = (annoton: Annoton, subjectNode: AnnotonNode, nodeType: AnnotonNodeType) => {
    const nodeDescription: InsertNodeDescription = insertNodeDescription[subjectNode.id][nodeType];

    const annotonNode = EntityDefinition.generateBaseTerm(nodeDescription.node.category, nodeDescription.node);

    annotonNode.id += '-' + getUuid();
    annoton.addNode(annotonNode);

    each(nodeDescription.triples, (triple) => {
        const objectId = triple.object ? triple.object : annotonNode.id;
        const predicate: Predicate = annoton.getNode(objectId).predicate;

        predicate.edge = Entity.createEntity(triple.predicate);
        annoton.addEdgeById(triple.subject, objectId, predicate);
    });

    annoton.resetPresentation();
};
