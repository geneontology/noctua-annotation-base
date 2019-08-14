import { noctuaFormConfig } from './../../noctua-form-config';
import { AnnotonNode, EntityLookup, Predicate, Annoton, Entity } from './../../models/annoton';
import * as EntityDefinition from './entity-definition';
import { each } from 'lodash';

export interface ActivityDescription {
    nodes: (() => AnnotonNode)[];
    triples,
    overrides?: AnnotonNode;
}

export const activityUnitData: ActivityDescription = {
    nodes: [
        EntityDefinition.generateMolecularFunction,
        EntityDefinition.generateMolecularEntity,
        EntityDefinition.generateBiologicalProcess,
        EntityDefinition.generateCellularComponent,
        EntityDefinition.generateCellTypeEntity,
        EntityDefinition.generateAnatomicalEntity,
        EntityDefinition.generateOrganism
    ],
    triples: [{
        subject: EntityDefinition.annotonNodeType.GoMolecularFunction,
        object: EntityDefinition.annotonNodeType.GoMolecularEntity,
        edge: noctuaFormConfig.edge.enabledBy
    }, {
        subject: EntityDefinition.annotonNodeType.GoMolecularFunction,
        object: EntityDefinition.annotonNodeType.GoBiologicalProcess,
        edge: noctuaFormConfig.edge.partOf
    }, {
        subject: EntityDefinition.annotonNodeType.GoMolecularFunction,
        object: EntityDefinition.annotonNodeType.GoCellularComponent,
        edge: noctuaFormConfig.edge.occursIn
    }, {
        subject: EntityDefinition.annotonNodeType.GoCellularComponent,
        object: EntityDefinition.annotonNodeType.GoCellTypeEntity,
        edge: noctuaFormConfig.edge.partOf
    }, {
        subject: EntityDefinition.annotonNodeType.GoCellTypeEntity,
        object: EntityDefinition.annotonNodeType.GoAnatomicalEntity,
        edge: noctuaFormConfig.edge.partOf
    }, {
        subject: EntityDefinition.annotonNodeType.GoAnatomicalEntity,
        object: EntityDefinition.annotonNodeType.GoOrganism,
        edge: noctuaFormConfig.edge.partOf
    }],
};

export const bpOnlyAnnotation = {
    nodes: [
        EntityDefinition.generateMolecularFunction,
        EntityDefinition.generateMolecularEntity,
        EntityDefinition.generateBiologicalProcess,
        EntityDefinition.generateCellularComponent,
        EntityDefinition.generateCellTypeEntity,
        EntityDefinition.generateAnatomicalEntity,
        EntityDefinition.generateOrganism
    ],
    triples: [{
        subject: EntityDefinition.annotonNodeType.GoMolecularFunction,
        object: EntityDefinition.annotonNodeType.GoMolecularEntity,
        edge: noctuaFormConfig.edge.enabledBy
    }, {
        subject: EntityDefinition.annotonNodeType.GoMolecularFunction,
        object: EntityDefinition.annotonNodeType.GoBiologicalProcess,
        edge: noctuaFormConfig.edge.causallyUpstreamOfOrWithin
    }, {
        subject: EntityDefinition.annotonNodeType.GoMolecularFunction,
        object: EntityDefinition.annotonNodeType.GoCellularComponent,
        edge: noctuaFormConfig.edge.occursIn
    }, {
        subject: EntityDefinition.annotonNodeType.GoCellularComponent,
        object: EntityDefinition.annotonNodeType.GoCellTypeEntity,
        edge: noctuaFormConfig.edge.partOf
    }, {
        subject: EntityDefinition.annotonNodeType.GoCellTypeEntity,
        object: EntityDefinition.annotonNodeType.GoAnatomicalEntity,
        edge: noctuaFormConfig.edge.partOf
    }, {
        subject: EntityDefinition.annotonNodeType.GoAnatomicalEntity,
        object: EntityDefinition.annotonNodeType.GoOrganism,
        edge: noctuaFormConfig.edge.partOf
    }],
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
    }
};

export const ccOnlyAnnotation = {
    nodes: [
        EntityDefinition.generateMolecularEntity,
        EntityDefinition.generateCellularComponent,
        EntityDefinition.generateCellTypeEntity,
        EntityDefinition.generateAnatomicalEntity,
        EntityDefinition.generateOrganism
    ],
    triples: [{
        subject: EntityDefinition.annotonNodeType.GoMolecularEntity,
        object: EntityDefinition.annotonNodeType.GoCellularComponent,
        edge: noctuaFormConfig.edge.enabledBy
    }, {
        subject: EntityDefinition.annotonNodeType.GoCellularComponent,
        object: EntityDefinition.annotonNodeType.GoCellTypeEntity,
        edge: noctuaFormConfig.edge.partOf
    }, {
        subject: EntityDefinition.annotonNodeType.GoCellTypeEntity,
        object: EntityDefinition.annotonNodeType.GoAnatomicalEntity,
        edge: noctuaFormConfig.edge.partOf
    }, {
        subject: EntityDefinition.annotonNodeType.GoAnatomicalEntity,
        object: EntityDefinition.annotonNodeType.GoOrganism,
        edge: noctuaFormConfig.edge.partOf
    }],
};

export const createActivity = (activityDescription: ActivityDescription): Annoton => {
    const self = this;
    const annoton = new Annoton();

    each(activityDescription.nodes, (nodeFn) => {
        annoton.addNode(nodeFn.call(self));
    });

    each(activityDescription.triples, (triple) => {
        const predicate: Predicate = annoton.getNode(triple.object).predicate;

        predicate.edge = Entity.createEntity(triple.edge);
        annoton.addEdgeById(triple.subject, triple.object, predicate);
    });

    const startNode = annoton.getNode(activityDescription.triples[0].subject);
    const startTriple = annoton.getEdge(
        activityDescription.triples[0].subject,
        activityDescription.triples[0].object);

    startNode.predicate = startTriple.predicate;

    annoton.enableSubmit();
    return annoton;
}
