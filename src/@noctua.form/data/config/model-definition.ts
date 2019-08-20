import { noctuaFormConfig } from './../../noctua-form-config';
import { AnnotonNode, EntityLookup, Predicate, Annoton, Entity, AnnotonType, AnnotonNodeDisplay } from './../../models/annoton';
import * as EntityDefinition from './entity-definition';
import { each } from 'lodash';

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
        [EntityDefinition.AnnotonNodeType.GoMolecularFunction]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoMolecularFunction.id,
            type: EntityDefinition.AnnotonNodeType.GoMolecularFunction,
            category: EntityDefinition.GoMolecularFunction.category,
            label: 'Molecular Function',
            aspect: 'F',
            relationship: noctuaFormConfig.edge.enabledBy,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.mf,
        },
        [EntityDefinition.AnnotonNodeType.GoMolecularEntity]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoMolecularEntity.id,
            type: EntityDefinition.AnnotonNodeType.GoMolecularEntity,
            category: EntityDefinition.GoMolecularEntity.category,
            label: 'Gene Product',
            relationship: noctuaFormConfig.edge.enabledBy,
            displaySection: noctuaFormConfig.displaySection.gp,
            displayGroup: noctuaFormConfig.displayGroup.gp,
        },
        [EntityDefinition.AnnotonNodeType.GoBiologicalProcess]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoBiologicalProcess.id,
            type: EntityDefinition.AnnotonNodeType.GoBiologicalProcess,
            category: EntityDefinition.GoBiologicalProcess.category,
            label: 'MF part of Biological Process',
            aspect: 'P',
            relationship: noctuaFormConfig.edge.partOf,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.bp,

            treeLevel: 2,
        },
        [EntityDefinition.AnnotonNodeType.GoCellularComponent]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoCellularComponent.id,
            type: EntityDefinition.AnnotonNodeType.GoCellularComponent,
            category: EntityDefinition.GoCellularComponent.category,
            label: 'MF occurs in Cellular Component',
            aspect: 'C',
            relationship: noctuaFormConfig.edge.occursIn,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.cc,
            treeLevel: 2,
        },
        [EntityDefinition.AnnotonNodeType.GoCellTypeEntity]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoCellTypeEntity.id,
            type: EntityDefinition.AnnotonNodeType.GoCellTypeEntity,
            category: EntityDefinition.GoCellTypeEntity.category,
            label: 'Part Of (Cell Type)',
            relationship: noctuaFormConfig.edge.partOf,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.cc,
            treeLevel: 3,
            isExtension: true,
        },
        [EntityDefinition.AnnotonNodeType.GoAnatomicalEntity]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoAnatomicalEntity.id,
            type: EntityDefinition.AnnotonNodeType.GoAnatomicalEntity,
            category: EntityDefinition.GoAnatomicalEntity.category,
            label: 'Part Of (Anatomy)',
            relationship: noctuaFormConfig.edge.partOf,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.cc,
            treeLevel: 4,
            isExtension: true,
        },
        [EntityDefinition.AnnotonNodeType.GoOrganism]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoOrganism.id,
            type: EntityDefinition.AnnotonNodeType.GoOrganism,
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
        subject: EntityDefinition.AnnotonNodeType.GoMolecularFunction,
        object: EntityDefinition.AnnotonNodeType.GoMolecularEntity,
        predicate: noctuaFormConfig.edge.enabledBy
    }, {
        subject: EntityDefinition.AnnotonNodeType.GoMolecularFunction,
        object: EntityDefinition.AnnotonNodeType.GoBiologicalProcess,
        predicate: noctuaFormConfig.edge.partOf
    }, {
        subject: EntityDefinition.AnnotonNodeType.GoMolecularFunction,
        object: EntityDefinition.AnnotonNodeType.GoCellularComponent,
        predicate: noctuaFormConfig.edge.occursIn
    }, {
        subject: EntityDefinition.AnnotonNodeType.GoCellularComponent,
        object: EntityDefinition.AnnotonNodeType.GoCellTypeEntity,
        predicate: noctuaFormConfig.edge.partOf
    }, {
        subject: EntityDefinition.AnnotonNodeType.GoCellTypeEntity,
        object: EntityDefinition.AnnotonNodeType.GoAnatomicalEntity,
        predicate: noctuaFormConfig.edge.partOf
    }, {
        subject: EntityDefinition.AnnotonNodeType.GoAnatomicalEntity,
        object: EntityDefinition.AnnotonNodeType.GoOrganism,
        predicate: noctuaFormConfig.edge.partOf
    }],
};

export const bpOnlyAnnotationDescription: ActivityDescription = {
    type: AnnotonType.bpOnly,
    nodes: {
        [EntityDefinition.AnnotonNodeType.GoMolecularFunction]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoMolecularFunction.id,
            type: EntityDefinition.AnnotonNodeType.GoMolecularFunction,
            category: EntityDefinition.GoMolecularFunction.category,
            label: 'Molecular Function',
            aspect: 'F',
            relationship: noctuaFormConfig.edge.enabledBy,
            displaySection: '',
            displayGroup: '',
        },
        [EntityDefinition.AnnotonNodeType.GoMolecularEntity]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoMolecularEntity.id,
            type: EntityDefinition.AnnotonNodeType.GoMolecularEntity,
            category: EntityDefinition.GoMolecularEntity.category,
            label: 'Gene Product',
            relationship: noctuaFormConfig.edge.enabledBy,
            displaySection: noctuaFormConfig.displaySection.gp,
            displayGroup: noctuaFormConfig.displayGroup.gp,
        },

        [EntityDefinition.AnnotonNodeType.GoBiologicalProcess]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoBiologicalProcess.id,
            type: EntityDefinition.AnnotonNodeType.GoBiologicalProcess,
            category: EntityDefinition.GoBiologicalProcess.category,
            label: 'Biological Process',
            aspect: 'P',
            relationship: noctuaFormConfig.edge.partOf,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.bp,
            treeLevel: 2,
        },
        [EntityDefinition.AnnotonNodeType.GoCellTypeEntity]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoCellTypeEntity.id,
            type: EntityDefinition.AnnotonNodeType.GoCellTypeEntity,
            category: EntityDefinition.GoCellTypeEntity.category,
            label: 'occurs in (Cell Type)',
            relationship: noctuaFormConfig.edge.occursIn,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.cc,
            treeLevel: 3,
            isExtension: true,
        },
        [EntityDefinition.AnnotonNodeType.GoAnatomicalEntity]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoAnatomicalEntity.id,
            type: EntityDefinition.AnnotonNodeType.GoAnatomicalEntity,
            category: EntityDefinition.GoAnatomicalEntity.category,
            label: 'Part Of (Anatomy)',
            relationship: noctuaFormConfig.edge.partOf,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.cc,
            treeLevel: 4,
            isExtension: true,
        },
        [EntityDefinition.AnnotonNodeType.GoOrganism]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoOrganism.id,
            type: EntityDefinition.AnnotonNodeType.GoOrganism,
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
        subject: EntityDefinition.AnnotonNodeType.GoMolecularFunction,
        object: EntityDefinition.AnnotonNodeType.GoMolecularEntity,
        predicate: noctuaFormConfig.edge.enabledBy
    }, {
        subject: EntityDefinition.AnnotonNodeType.GoMolecularFunction,
        object: EntityDefinition.AnnotonNodeType.GoBiologicalProcess,
        predicate: noctuaFormConfig.edge.causallyUpstreamOfOrWithin
    }, {
        subject: EntityDefinition.AnnotonNodeType.GoBiologicalProcess,
        object: EntityDefinition.AnnotonNodeType.GoCellTypeEntity,
        predicate: noctuaFormConfig.edge.occursIn
    }, {
        subject: EntityDefinition.AnnotonNodeType.GoCellTypeEntity,
        object: EntityDefinition.AnnotonNodeType.GoAnatomicalEntity,
        predicate: noctuaFormConfig.edge.partOf
    }, {
        subject: EntityDefinition.AnnotonNodeType.GoAnatomicalEntity,
        object: EntityDefinition.AnnotonNodeType.GoOrganism,
        predicate: noctuaFormConfig.edge.partOf
    }],
    overrides: {
        [EntityDefinition.AnnotonNodeType.GoMolecularFunction]: <AnnotonNodeDisplay>{
            displaySection: '',
            displayGroup: '',
        },
        [EntityDefinition.AnnotonNodeType.GoBiologicalProcess]: <AnnotonNodeDisplay>{
            label: 'Biological Process',
            treeLevel: 2
        },
        [EntityDefinition.AnnotonNodeType.GoCellTypeEntity]: <AnnotonNodeDisplay>{
            label: 'occurs in (Cell Type)',
            relationship: noctuaFormConfig.edge.occursIn,
            treeLevel: 3
        },
        [EntityDefinition.AnnotonNodeType.GoAnatomicalEntity]: <AnnotonNodeDisplay>{
            treeLevel: 4
        },
        [EntityDefinition.AnnotonNodeType.GoOrganism]: <AnnotonNodeDisplay>{
            treeLevel: 5
        }
    }
};

export const ccOnlyAnnotationDescription: ActivityDescription = {
    type: AnnotonType.ccOnly,
    nodes: {
        [EntityDefinition.AnnotonNodeType.GoMolecularEntity]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoMolecularEntity.id,
            type: EntityDefinition.AnnotonNodeType.GoMolecularEntity,
            category: EntityDefinition.GoMolecularEntity.category,
            label: 'Gene Product',
            relationship: noctuaFormConfig.edge.enabledBy,
            displaySection: noctuaFormConfig.displaySection.gp,
            displayGroup: noctuaFormConfig.displayGroup.gp,
        },
        [EntityDefinition.AnnotonNodeType.GoCellularComponent]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoCellularComponent.id,
            type: EntityDefinition.AnnotonNodeType.GoCellularComponent,
            category: EntityDefinition.GoCellularComponent.category,
            aspect: 'C',
            label: 'GP located in Cellular Component',
            relationship: noctuaFormConfig.edge.locatedIn,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.cc,
            treeLevel: 2,
        },
        [EntityDefinition.AnnotonNodeType.GoCellTypeEntity]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoCellTypeEntity.id,
            type: EntityDefinition.AnnotonNodeType.GoCellTypeEntity,
            category: EntityDefinition.GoCellTypeEntity.category,
            label: 'Part Of (Cell Type)',
            relationship: noctuaFormConfig.edge.partOf,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.cc,
            treeLevel: 3,
            isExtension: true,
        },
        [EntityDefinition.AnnotonNodeType.GoAnatomicalEntity]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoAnatomicalEntity.id,
            type: EntityDefinition.AnnotonNodeType.GoAnatomicalEntity,
            category: EntityDefinition.GoAnatomicalEntity.category,
            label: 'Part Of (Anatomy)',
            relationship: noctuaFormConfig.edge.partOf,
            displaySection: noctuaFormConfig.displaySection.fd,
            displayGroup: noctuaFormConfig.displayGroup.cc,
            treeLevel: 4,
            isExtension: true,
        },
        [EntityDefinition.AnnotonNodeType.GoOrganism]: <AnnotonNodeDisplay>{
            id: EntityDefinition.GoOrganism.id,
            type: EntityDefinition.AnnotonNodeType.GoOrganism,
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
        subject: EntityDefinition.AnnotonNodeType.GoMolecularEntity,
        object: EntityDefinition.AnnotonNodeType.GoCellularComponent,
        predicate: noctuaFormConfig.edge.enabledBy
    }, {
        subject: EntityDefinition.AnnotonNodeType.GoCellularComponent,
        object: EntityDefinition.AnnotonNodeType.GoCellTypeEntity,
        predicate: noctuaFormConfig.edge.partOf
    }, {
        subject: EntityDefinition.AnnotonNodeType.GoCellTypeEntity,
        object: EntityDefinition.AnnotonNodeType.GoAnatomicalEntity,
        predicate: noctuaFormConfig.edge.partOf
    }, {
        subject: EntityDefinition.AnnotonNodeType.GoAnatomicalEntity,
        object: EntityDefinition.AnnotonNodeType.GoOrganism,
        predicate: noctuaFormConfig.edge.partOf
    }],
};

export const insertNodeDescription = {
    [EntityDefinition.AnnotonNodeType.GoMolecularFunction]: {
        [EntityDefinition.AnnotonNodeType.GoChemicalEntity]: <InsertNodeDescription>{
            node: <AnnotonNodeDisplay>{
                id: EntityDefinition.GoChemicalEntity.id,
                category: EntityDefinition.GoChemicalEntity.category,
                label: 'Has Input (Gene Product/Chemical)',
                relationship: noctuaFormConfig.edge.hasInput,
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.mf,
                treeLevel: 3,
                isExtension: true,
            },
            triples: [{
                subject: EntityDefinition.AnnotonNodeType.GoMolecularFunction,
                object: EntityDefinition.AnnotonNodeType.GoChemicalEntity,
                predicate: noctuaFormConfig.edge.hasInput
            }],
        }
    },
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

export const insertNode = (annoton: Annoton, subjectNode: AnnotonNode, nodeType: EntityDefinition.AnnotonNodeType) => {
    const nodeDescription: InsertNodeDescription = insertNodeDescription[subjectNode.id][nodeType];

    const annotonNode = EntityDefinition.generateBaseTerm(nodeDescription.node.category, nodeDescription.node);
    annoton.addNode(annotonNode);

    each(nodeDescription.triples, (triple) => {
        const predicate: Predicate = annoton.getNode(triple.object).predicate;

        predicate.edge = Entity.createEntity(triple.predicate);
        annoton.addEdgeById(triple.subject, triple.object, predicate);
    });

    return annoton;
};
