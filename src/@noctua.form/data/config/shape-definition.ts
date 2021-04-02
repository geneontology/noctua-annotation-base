import { noctuaFormConfig } from './../../noctua-form-config';
import { Entity, ActivityNodeDisplay } from './../../models/activity';
import * as EntityDefinition from './entity-definition';
import { ActivityNodeType } from './../../models/activity/activity-node';
import { each } from 'lodash';

export enum CardinalityType {
    none = 'none',
    oneToOne = 'oneToOne',
    oneToMany = 'oneToMany',
}

export interface ShapeDescription {
    id: string;
    label: string;
    node: ActivityNodeDisplay;
    predicate: Entity;
    cardinality: CardinalityType;
}

const addCausalEdges = (edges: Entity[]): ShapeDescription[] => {
    const causalShapeDescriptions: ShapeDescription[] = [];

    each(edges, (edge: Entity) => {
        causalShapeDescriptions.push({
            id: ActivityNodeType.GoBiologicalProcess,
            node: <ActivityNodeDisplay>{
                type: ActivityNodeType.GoBiologicalProcess,
                category: [EntityDefinition.GoBiologicalProcess],
                aspect: 'P',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.bp,
                isKey: true,
                relationEditable: true,
                weight: 10,
            },
            predicate: edge,
            cardinality: CardinalityType.oneToOne
        } as ShapeDescription);
    });

    return causalShapeDescriptions;
};

export const canInsertEntity = {
    [ActivityNodeType.GoMolecularEntity]: [
        <ShapeDescription>{
            label: 'Add Part Of (Cellular Component)',
            id: ActivityNodeType.GoCellularComponent,
            node: <ActivityNodeDisplay>{
                type: ActivityNodeType.GoCellularComponent,
                category: [EntityDefinition.GoCellularComponent],
                label: 'MF part of Cellular Component',
                aspect: 'C',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                weight: 10,
                isKey: true,
            },
            predicate: noctuaFormConfig.edge.partOf,
            cardinality: CardinalityType.oneToOne
        },
    ],
    [ActivityNodeType.GoMolecularFunction]: [
        <ShapeDescription>{
            label: 'Add Enabled by GP',
            id: ActivityNodeType.GoMolecularEntity,
            node: <ActivityNodeDisplay>{
                id: EntityDefinition.GoMolecularEntity.id,
                type: ActivityNodeType.GoMolecularEntity,
                category: [EntityDefinition.GoMolecularEntity],
                label: 'MF enabled by Gene Product',
                skipEvidence: true,
                displaySection: noctuaFormConfig.displaySection.gp,
                displayGroup: noctuaFormConfig.displayGroup.gp,
                termRequired: true,
                weight: 2,
                isKey: true
            },
            predicate: noctuaFormConfig.edge.enabledBy,
            cardinality: CardinalityType.oneToOne
        },
        <ShapeDescription>{
            label: 'Add Part Of (Biological Process)',
            id: ActivityNodeType.GoBiologicalProcess,
            node: <ActivityNodeDisplay>{
                type: ActivityNodeType.GoBiologicalProcess,
                category: [EntityDefinition.GoBiologicalProcess],
                label: 'MF part of Biological Process',
                aspect: 'P',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.bp,
                weight: 10,
                showInMenu: true,
            },
            predicate: noctuaFormConfig.edge.partOf,
            cardinality: CardinalityType.oneToOne
        },
        <ShapeDescription>{
            label: 'Add Occurs In (Cellular Component)',
            id: ActivityNodeType.GoCellularComponent,
            node: <ActivityNodeDisplay>{
                type: ActivityNodeType.GoCellularComponent,
                category: [EntityDefinition.GoCellularComponent],
                label: 'MF occurs in Cellular Component',
                aspect: 'C',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                weight: 20,
                showInMenu: true,
            },
            predicate: noctuaFormConfig.edge.occursIn,
            cardinality: CardinalityType.oneToOne
        },
        <ShapeDescription>{
            label: 'Add Occurs In (Cell Type)',
            id: ActivityNodeType.GoCellTypeEntity,
            node: <ActivityNodeDisplay>{
                category: [EntityDefinition.GoCellTypeEntity],
                type: ActivityNodeType.GoCellTypeEntity,
                label: 'Occurs In (Cell Type)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                isExtension: false,
                weight: 30,

            },
            predicate: noctuaFormConfig.edge.occursIn,
            cardinality: CardinalityType.oneToOne
        },
        <ShapeDescription>{
            label: 'Add Occurs In (Anatomy)',
            id: ActivityNodeType.GoAnatomicalEntity,
            node: <ActivityNodeDisplay>{
                category: [EntityDefinition.GoAnatomicalEntity],
                type: ActivityNodeType.GoAnatomicalEntity,
                label: 'Occurs In (Anatomy)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                isExtension: true,
                weight: 40,
            },
            predicate: noctuaFormConfig.edge.occursIn,
            cardinality: CardinalityType.oneToOne
        },
        <ShapeDescription>{
            label: 'Add Occurs In (Organism)',
            id: ActivityNodeType.GoOrganism,
            node: <ActivityNodeDisplay>{
                category: [EntityDefinition.GoOrganism],
                type: ActivityNodeType.GoOrganism,
                label: 'Part Of (Organism)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                isExtension: true,
                weight: 50,
            },
            predicate: noctuaFormConfig.edge.occursIn,
            cardinality: CardinalityType.oneToOne
        },
        <ShapeDescription>{
            label: 'Add Has Input (Chemical/Protein Containing Complex)',
            id: ActivityNodeType.GoChemicalEntityHasInput,
            node: <ActivityNodeDisplay>{
                category: [EntityDefinition.GoChemicalEntity, EntityDefinition.GoProteinContainingComplex],
                type: ActivityNodeType.GoChemicalEntityHasInput,
                label: 'Has Input (Chemical/Protein Containing Complex)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.mf,
                isExtension: true,
                weight: 4,
                showInMenu: true,
            },
            predicate: noctuaFormConfig.edge.hasInput,
            cardinality: CardinalityType.oneToMany
        },
        <ShapeDescription>{
            label: 'Add Has Output (Chemical/Protein Containing Complex)',
            id: ActivityNodeType.GoChemicalEntityHasOutput,
            node: <ActivityNodeDisplay>{
                category: [EntityDefinition.GoChemicalEntity, EntityDefinition.GoProteinContainingComplex],
                type: ActivityNodeType.GoChemicalEntityHasOutput,
                label: 'Has Output (Chemical/Protein Containing Complex)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.mf,
                isExtension: true,
                weight: 5,
                showInMenu: true,
            },
            predicate: noctuaFormConfig.edge.hasOutput,
            cardinality: CardinalityType.oneToMany
        },
        <ShapeDescription>{
            label: 'Add Happens During (Biological Phase)',
            id: ActivityNodeType.GoBiologicalPhase,
            node: <ActivityNodeDisplay>{
                category: [EntityDefinition.GoBiologicalPhase],
                type: ActivityNodeType.GoBiologicalPhase,
                label: 'Happens During (Biological Phase)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.mf,
                isExtension: true,
                weight: 3,
                showInMenu: true,
            },
            predicate: noctuaFormConfig.edge.happensDuring,
            cardinality: CardinalityType.oneToOne
        },

        // Causal Edges
        ...addCausalEdges([
            Entity.createEntity(noctuaFormConfig.edge.causallyUpstreamOfOrWithin),
            Entity.createEntity(noctuaFormConfig.edge.causallyUpstreamOf),
            Entity.createEntity(noctuaFormConfig.edge.causallyUpstreamOfNegativeEffect),
            Entity.createEntity(noctuaFormConfig.edge.causallyUpstreamOfPositiveEffect),
            Entity.createEntity(noctuaFormConfig.edge.causallyUpstreamOfOrWithinPositiveEffect),
            Entity.createEntity(noctuaFormConfig.edge.causallyUpstreamOfOrWithinNegativeEffect),
        ])
    ],
    [ActivityNodeType.GoBiologicalProcess]: [
        <ShapeDescription>{
            label: 'Add Part Of (Biological Process)',
            id: ActivityNodeType.GoBiologicalProcess,
            node: <ActivityNodeDisplay>{
                category: [EntityDefinition.GoBiologicalProcess],
                type: ActivityNodeType.GoBiologicalProcess,
                label: 'Part Of (Biological Process)',
                aspect: 'P',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.bp,
                isExtension: true,
                weight: 10,
                showInMenu: true,
            },
            predicate: noctuaFormConfig.edge.partOf,
            cardinality: CardinalityType.oneToOne
        },
        <ShapeDescription>{
            label: 'Add Occurs In (Cellular Component)',
            id: ActivityNodeType.GoCellularComponent,
            node: <ActivityNodeDisplay>{
                category: [EntityDefinition.GoCellularComponent],
                type: ActivityNodeType.GoCellularComponent,
                aspect: 'C',
                label: 'Occurs In Cellular Component',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.bp,
                isExtension: true,
                weight: 20
            },
            predicate: noctuaFormConfig.edge.occursIn,
            cardinality: CardinalityType.oneToOne
        },
        <ShapeDescription>{
            label: 'Add Has Input (Chemical/Anatomical Entity/Protein Containing Complex)',
            id: ActivityNodeType.GoChemicalEntityHasInput,
            node: <ActivityNodeDisplay>{
                category: [
                    EntityDefinition.GoChemicalEntity,
                    EntityDefinition.GoAnatomicalEntity,
                    EntityDefinition.GoProteinContainingComplex
                ],
                type: ActivityNodeType.GoChemicalEntityHasInput,
                label: 'Has Input (Chemical/Anatomical Entity/Protein Containing Complex)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.bp,
                isExtension: true,
                weight: 14,
                showInMenu: true,
            },
            predicate: noctuaFormConfig.edge.hasInput,
            cardinality: CardinalityType.oneToMany
        },
        <ShapeDescription>{
            label: 'Add Has Output (Chemical/Anatomical Entity/Protein Containing Complex)',
            id: ActivityNodeType.GoChemicalEntityHasInput,
            node: <ActivityNodeDisplay>{
                category: [
                    EntityDefinition.GoChemicalEntity,
                    EntityDefinition.GoAnatomicalEntity,
                    EntityDefinition.GoProteinContainingComplex
                ],
                type: ActivityNodeType.GoChemicalEntityHasOutput,
                label: 'Has Output (Chemical/Anatomical Entity/Protein Containing Complex)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.bp,
                isExtension: true,
                weight: 14,
                showInMenu: true,
            },
            predicate: noctuaFormConfig.edge.hasOutput,
            cardinality: CardinalityType.oneToMany
        },
    ],
    [ActivityNodeType.GoCellularComponent]: [
        <ShapeDescription>{
            label: 'Add Part Of (Cellular Component)',
            id: ActivityNodeType.GoCellularComponent,
            node: <ActivityNodeDisplay>{
                category: [EntityDefinition.GoCellularComponent],
                type: ActivityNodeType.GoCellularComponent,
                aspect: 'C',
                label: 'Part Of Cellular Component',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                isExtension: true,
                weight: 20,
                showInMenu: true,
            },
            predicate: noctuaFormConfig.edge.partOf,
            cardinality: CardinalityType.oneToOne
        },
        <ShapeDescription>{
            label: 'Add Part Of (Cell Type)',
            id: ActivityNodeType.GoCellTypeEntity,
            node: <ActivityNodeDisplay>{
                category: [EntityDefinition.GoCellTypeEntity],
                type: ActivityNodeType.GoCellTypeEntity,
                label: 'Part Of (Cell Type)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                isExtension: true,
                weight: 30,
                showInMenu: true,
            },
            predicate: noctuaFormConfig.edge.partOf,
            cardinality: CardinalityType.oneToOne
        },
        <ShapeDescription>{
            label: 'Add Part Of (Anatomy)',
            id: ActivityNodeType.GoAnatomicalEntity,
            node: <ActivityNodeDisplay>{
                category: [EntityDefinition.GoAnatomicalEntity],
                type: ActivityNodeType.GoAnatomicalEntity,
                label: 'Part Of (Anatomy)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                isExtension: true,
                weight: 40,
                showInMenu: true,
            },
            predicate: noctuaFormConfig.edge.partOf,
            cardinality: CardinalityType.oneToOne
        },
        <ShapeDescription>{
            label: 'Add Part Of (Organism)',
            id: ActivityNodeType.GoOrganism,
            node: <ActivityNodeDisplay>{
                category: [EntityDefinition.GoOrganism],
                type: ActivityNodeType.GoOrganism,
                label: 'Part Of (Organism)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                isExtension: true,
                weight: 50,
                showInMenu: true,
            },
            predicate: noctuaFormConfig.edge.partOf,
            cardinality: CardinalityType.oneToOne
        }
    ],
    [ActivityNodeType.GoCellTypeEntity]: [
        <ShapeDescription>{
            label: 'Add Part Of (Anatomy)',
            id: ActivityNodeType.GoAnatomicalEntity,
            node: <ActivityNodeDisplay>{
                category: [EntityDefinition.GoAnatomicalEntity],
                type: ActivityNodeType.GoAnatomicalEntity,
                label: 'Part Of (Anatomy)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                isExtension: true,
                weight: 40,
                showInMenu: true,
            },
            predicate: noctuaFormConfig.edge.partOf,
            cardinality: CardinalityType.oneToOne
        },
        <ShapeDescription>{
            label: 'Add Part Of (Organism)',
            id: ActivityNodeType.GoOrganism,
            node: <ActivityNodeDisplay>{
                category: [EntityDefinition.GoOrganism],
                type: ActivityNodeType.GoOrganism,
                label: 'Part Of (Organism)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                isExtension: true,
                weight: 50,
                showInMenu: true,
            },
            predicate: noctuaFormConfig.edge.partOf,
            cardinality: CardinalityType.oneToOne
        }
    ],
    [ActivityNodeType.GoAnatomicalEntity]: [
        <ShapeDescription>{
            label: 'Add Part Of (Organism)',
            id: ActivityNodeType.GoOrganism,
            node: <ActivityNodeDisplay>{
                category: [EntityDefinition.GoOrganism],
                type: ActivityNodeType.GoOrganism,
                label: 'Part Of (Organism)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                isExtension: true,
                weight: 50,
                showInMenu: true,
            },
            predicate: noctuaFormConfig.edge.partOf,
            cardinality: CardinalityType.oneToOne
        }
    ]
};




