import { noctuaFormConfig } from './../../noctua-form-config';
import { AnnotonNode, EntityLookup, Predicate, Annoton, Entity } from './../../models/annoton';
import * as EntityDefinition from './entity-definition';
import { each } from 'lodash';

const activityUnitData = {
    nodes: [
        EntityDefinition.generateMolecularFunction,
        EntityDefinition.generateMolecularEntity,
        EntityDefinition.generateBiologicalProcess,
        EntityDefinition.generateCellularComponent,
        EntityDefinition.generateBiologicalPhase,
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
        subject: EntityDefinition.annotonNodeType.GoMolecularFunction,
        object: EntityDefinition.annotonNodeType.GoBiologicalPhase,
        edge: noctuaFormConfig.edge.happensDuring
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

export const createActivityUnit = (): Annoton => {
    const self = this;
    const annoton = new Annoton();

    each(activityUnitData.nodes, (nodeFn) => {
        annoton.addNode(nodeFn.call(self));
    });

    each(activityUnitData.triples, (triple) => {
        const predicate: Predicate = annoton.getNode(triple.object).predicate;

        predicate.edge = Entity.createEntity(triple.edge);
        annoton.addEdgeById(triple.subject, triple.object, predicate);
    });

    const startNode = annoton.getNode(activityUnitData.triples[0].subject);
    const startTriple = annoton.getEdge(
        activityUnitData.triples[0].subject,
        activityUnitData.triples[0].object);

    startNode.predicate = startTriple.predicate;

    annoton.enableSubmit();
    return annoton;
}

