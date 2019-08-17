import { noctuaFormConfig } from './../../noctua-form-config';
import { AnnotonNode, EntityLookup, Predicate, Annoton, Entity, AnnotonType, AnnotonNodeDisplay } from './../../models/annoton';
import * as EntityDefinition from './entity-definition';
import { each } from 'lodash';

export interface ActivityDescription {
    type: AnnotonType;
    nodes: (() => AnnotonNode)[];
    triples: { subject: string, object: string, predicate: any }[];
    overrides?: { [key: string]: AnnotonNodeDisplay };
}

export const activityUnitData: ActivityDescription = {
    type: AnnotonType.default,
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
        predicate: noctuaFormConfig.edge.enabledBy
    }, {
        subject: EntityDefinition.annotonNodeType.GoMolecularFunction,
        object: EntityDefinition.annotonNodeType.GoBiologicalProcess,
        predicate: noctuaFormConfig.edge.partOf
    }, {
        subject: EntityDefinition.annotonNodeType.GoMolecularFunction,
        object: EntityDefinition.annotonNodeType.GoCellularComponent,
        predicate: noctuaFormConfig.edge.occursIn
    }, {
        subject: EntityDefinition.annotonNodeType.GoCellularComponent,
        object: EntityDefinition.annotonNodeType.GoCellTypeEntity,
        predicate: noctuaFormConfig.edge.partOf
    }, {
        subject: EntityDefinition.annotonNodeType.GoCellTypeEntity,
        object: EntityDefinition.annotonNodeType.GoAnatomicalEntity,
        predicate: noctuaFormConfig.edge.partOf
    }, {
        subject: EntityDefinition.annotonNodeType.GoAnatomicalEntity,
        object: EntityDefinition.annotonNodeType.GoOrganism,
        predicate: noctuaFormConfig.edge.partOf
    }],
};

export const bpOnlyAnnotation: ActivityDescription = {
    type: AnnotonType.bpOnly,
    nodes: [
        EntityDefinition.generateMolecularFunction,
        EntityDefinition.generateMolecularEntity,
        EntityDefinition.generateBiologicalProcess,
        EntityDefinition.generateCellTypeEntity,
        EntityDefinition.generateAnatomicalEntity,
        EntityDefinition.generateOrganism
    ],
    triples: [{
        subject: EntityDefinition.annotonNodeType.GoMolecularFunction,
        object: EntityDefinition.annotonNodeType.GoMolecularEntity,
        predicate: noctuaFormConfig.edge.enabledBy
    }, {
        subject: EntityDefinition.annotonNodeType.GoMolecularFunction,
        object: EntityDefinition.annotonNodeType.GoBiologicalProcess,
        predicate: noctuaFormConfig.edge.causallyUpstreamOfOrWithin
    }, {
        subject: EntityDefinition.annotonNodeType.GoBiologicalProcess,
        object: EntityDefinition.annotonNodeType.GoCellTypeEntity,
        predicate: noctuaFormConfig.edge.occursIn
    }, {
        subject: EntityDefinition.annotonNodeType.GoCellTypeEntity,
        object: EntityDefinition.annotonNodeType.GoAnatomicalEntity,
        predicate: noctuaFormConfig.edge.partOf
    }, {
        subject: EntityDefinition.annotonNodeType.GoAnatomicalEntity,
        object: EntityDefinition.annotonNodeType.GoOrganism,
        predicate: noctuaFormConfig.edge.partOf
    }],
    overrides: {
        [EntityDefinition.annotonNodeType.GoMolecularFunction]: <AnnotonNodeDisplay>{
            displaySection: '',
            displayGroup: '',
        },
        [EntityDefinition.annotonNodeType.GoBiologicalProcess]: <AnnotonNodeDisplay>{
            label: 'Biological Process',
            treeLevel: 2
        },
        [EntityDefinition.annotonNodeType.GoCellTypeEntity]: <AnnotonNodeDisplay>{
            label: 'occurs in (Cell Type)',
            relationship: noctuaFormConfig.edge.occursIn,
            treeLevel: 3
        },
        [EntityDefinition.annotonNodeType.GoAnatomicalEntity]: <AnnotonNodeDisplay>{
            treeLevel: 4
        },
        [EntityDefinition.annotonNodeType.GoOrganism]: <AnnotonNodeDisplay>{
            treeLevel: 5
        }
    }
};

export const ccOnlyAnnotation: ActivityDescription = {
    type: AnnotonType.ccOnly,
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
        predicate: noctuaFormConfig.edge.enabledBy
    }, {
        subject: EntityDefinition.annotonNodeType.GoCellularComponent,
        object: EntityDefinition.annotonNodeType.GoCellTypeEntity,
        predicate: noctuaFormConfig.edge.partOf
    }, {
        subject: EntityDefinition.annotonNodeType.GoCellTypeEntity,
        object: EntityDefinition.annotonNodeType.GoAnatomicalEntity,
        predicate: noctuaFormConfig.edge.partOf
    }, {
        subject: EntityDefinition.annotonNodeType.GoAnatomicalEntity,
        object: EntityDefinition.annotonNodeType.GoOrganism,
        predicate: noctuaFormConfig.edge.partOf
    }],
    overrides: {
        [EntityDefinition.annotonNodeType.GoCellularComponent]: <AnnotonNodeDisplay>{
            label: 'GP located in Cellular Component',
            relationship: noctuaFormConfig.edge.locatedIn,
            treeLevel: 2
        },
        [EntityDefinition.annotonNodeType.GoCellTypeEntity]: <AnnotonNodeDisplay>{
            relationship: noctuaFormConfig.edge.occursIn,
            treeLevel: 3
        },
        [EntityDefinition.annotonNodeType.GoAnatomicalEntity]: <AnnotonNodeDisplay>{
            treeLevel: 4
        },
        [EntityDefinition.annotonNodeType.GoOrganism]: <AnnotonNodeDisplay>{
            treeLevel: 5
        }
    }
};

export const createActivity = (activityDescription: ActivityDescription): Annoton => {
    const self = this;
    const annoton = new Annoton();

    annoton.annotonType = activityDescription.type;

    each(activityDescription.nodes, (nodeFn) => {
        annoton.addNode(nodeFn.call(self));
    });

    each(activityDescription.overrides, (override: AnnotonNodeDisplay, key: EntityDefinition.annotonNodeType) => {
        const node: AnnotonNode = annoton.getNode(key);
        node.overrideValues(override);
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
}
