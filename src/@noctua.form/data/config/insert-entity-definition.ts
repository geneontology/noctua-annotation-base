import { noctuaFormConfig } from './../../noctua-form-config';
import { Entity, AnnotonNodeDisplay } from './../../models/annoton';
import * as EntityDefinition from './entity-definition';
import { AnnotonNodeType } from './../../models/annoton/annoton-node';

declare const require: any;

export enum CardinalityType {
    none = 'none',
    oneToOne = 'oneToOne',
    oneToMany = 'oneToMany',
}

export interface InsertNodeDescription {
    id: string;
    label: string;
    node: AnnotonNodeDisplay;
    predicate: Entity;
    cardinality: CardinalityType;
}

export const canInsertEntity = {
    [AnnotonNodeType.GoMolecularFunction]: [
        <InsertNodeDescription>{
            label: 'Add Part Of (Biological Process',
            id: AnnotonNodeType.GoBiologicalPhase,
            node: <AnnotonNodeDisplay>{
                type: AnnotonNodeType.GoBiologicalProcess,
                category: [EntityDefinition.GoBiologicalProcess],
                label: 'MF part of Biological Process',
                aspect: 'P',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.bp,
                treeLevel: 2,
                weight: 10,
            },
            predicate: noctuaFormConfig.edge.partOf,
            cardinality: CardinalityType.oneToOne
        },
        <InsertNodeDescription>{
            label: 'Add Occurs In (Cellular Component)',
            id: AnnotonNodeType.GoBiologicalPhase,
            node: <AnnotonNodeDisplay>{
                type: AnnotonNodeType.GoCellularComponent,
                category: [EntityDefinition.GoCellularComponent],
                label: 'MF occurs in Cellular Component',
                aspect: 'C',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                treeLevel: 2,
                weight: 20
            },
            predicate: noctuaFormConfig.edge.occursIn,
            cardinality: CardinalityType.oneToOne
        },
        <InsertNodeDescription>{
            label: 'Add Occurs In (Cell Type)',
            id: AnnotonNodeType.GoCellTypeEntity,
            node: <AnnotonNodeDisplay>{
                category: [EntityDefinition.GoCellTypeEntity],
                type: AnnotonNodeType.GoCellTypeEntity,
                label: 'Occurs In (Cell Type)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                treeLevel: 3,
                isExtension: false,
                weight: 30
            },
            predicate: noctuaFormConfig.edge.occursIn,
            cardinality: CardinalityType.oneToOne
        },
        <InsertNodeDescription>{
            label: 'Add Occurs In (Anatomy)',
            id: AnnotonNodeType.GoAnatomicalEntity,
            node: <AnnotonNodeDisplay>{
                category: [EntityDefinition.GoAnatomicalEntity],
                type: AnnotonNodeType.GoAnatomicalEntity,
                label: 'Occurs In (Anatomy)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                treeLevel: 3,
                isExtension: true,
                weight: 40
            },
            predicate: noctuaFormConfig.edge.occursIn,
            cardinality: CardinalityType.oneToOne
        },
        <InsertNodeDescription>{
            label: 'Add Occurs In (Organism)',
            id: AnnotonNodeType.GoOrganism,
            node: <AnnotonNodeDisplay>{
                category: [EntityDefinition.GoOrganism],
                type: AnnotonNodeType.GoOrganism,
                label: 'Part Of (Organism)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                treeLevel: 3,
                isExtension: true,
                weight: 50
            },
            predicate: noctuaFormConfig.edge.occursIn,
            cardinality: CardinalityType.oneToOne
        },
        <InsertNodeDescription>{
            label: 'Add Has Input (Chemical/Protein Containing Complex)',
            id: AnnotonNodeType.GoChemicalEntityHasInput,
            node: <AnnotonNodeDisplay>{
                category: [EntityDefinition.GoChemicalEntity, EntityDefinition.GoProteinContainingComplex],
                type: AnnotonNodeType.GoChemicalEntityHasInput,
                label: 'Has Input (GP/Chemical)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.mf,
                treeLevel: 2,
                isExtension: true,
                weight: 4
            },
            predicate: noctuaFormConfig.edge.hasInput,
            cardinality: CardinalityType.oneToMany
        },
        <InsertNodeDescription>{
            label: 'Add Has Output (GP/Chemical)',
            id: AnnotonNodeType.GoChemicalEntityHasOutput,
            node: <AnnotonNodeDisplay>{
                category: [EntityDefinition.GoChemicalEntity, EntityDefinition.GoProteinContainingComplex],
                type: AnnotonNodeType.GoChemicalEntityHasOutput,
                label: 'Has Output (GP/Chemical)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.mf,
                treeLevel: 2,
                isExtension: true,
                weight: 5
            },
            predicate: noctuaFormConfig.edge.hasOutput,
            cardinality: CardinalityType.oneToMany
        },
        <InsertNodeDescription>{
            label: 'Add Happens During (Biological Phase)',
            id: AnnotonNodeType.GoBiologicalPhase,
            node: <AnnotonNodeDisplay>{
                category: [EntityDefinition.GoBiologicalPhase],
                type: AnnotonNodeType.GoBiologicalPhase,
                label: 'Happens During (Temporal Phase)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.mf,
                treeLevel: 2,
                isExtension: true,
                weight: 3
            },
            predicate: noctuaFormConfig.edge.happensDuring,
            cardinality: CardinalityType.oneToOne
        }
    ],
    [AnnotonNodeType.GoBiologicalProcess]: [
        <InsertNodeDescription>{
            label: 'Add Part Of (Biological Process)',
            id: AnnotonNodeType.GoBiologicalProcess,
            node: <AnnotonNodeDisplay>{
                category: [EntityDefinition.GoBiologicalProcess],
                type: AnnotonNodeType.GoBiologicalProcess,
                label: 'Part Of (Biological Process)',
                aspect: 'P',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.bp,
                treeLevel: 3,
                isExtension: true,
                weight: 10
            },
            predicate: noctuaFormConfig.edge.partOf,
            cardinality: CardinalityType.oneToOne
        },
        <InsertNodeDescription>{
            label: 'Add Occurs In (Cellular Component)',
            id: AnnotonNodeType.GoCellularComponent,
            node: <AnnotonNodeDisplay>{
                category: [EntityDefinition.GoCellularComponent],
                type: AnnotonNodeType.GoCellularComponent,
                aspect: 'C',
                label: 'Occurs In Cellular Component',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.bp,
                treeLevel: 4,
                isExtension: true,
                weight: 20
            },
            predicate: noctuaFormConfig.edge.occursIn,
            cardinality: CardinalityType.oneToOne
        },
        <InsertNodeDescription>{
            label: 'Add Has Input (Chemical/Protein Containing Complex)',
            id: AnnotonNodeType.GoChemicalEntityHasInput,
            node: <AnnotonNodeDisplay>{
                category: [
                    EntityDefinition.GoChemicalEntity,
                    EntityDefinition.GoAnatomicalEntity,
                    EntityDefinition.GoProteinContainingComplex
                ],
                type: AnnotonNodeType.GoChemicalEntityHasInput,
                label: 'Has Input (GP/Chemical)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.mf,
                treeLevel: 3,
                isExtension: true,
                weight: 14
            },
            predicate: noctuaFormConfig.edge.hasInput,
            cardinality: CardinalityType.oneToMany
        },
        <InsertNodeDescription>{
            label: 'Add Has Output (Chemical/Protein Containing Complex)',
            id: AnnotonNodeType.GoChemicalEntityHasInput,
            node: <AnnotonNodeDisplay>{
                category: [
                    EntityDefinition.GoChemicalEntity,
                    EntityDefinition.GoAnatomicalEntity,
                    EntityDefinition.GoProteinContainingComplex
                ],
                type: AnnotonNodeType.GoChemicalEntityHasOutput,
                label: 'Has Output (GP/Chemical)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.mf,
                treeLevel: 3,
                isExtension: true,
                weight: 14
            },
            predicate: noctuaFormConfig.edge.hasOutput,
            cardinality: CardinalityType.oneToMany
        },
    ],
    [AnnotonNodeType.GoCellularComponent]: [
        <InsertNodeDescription>{
            label: 'Add Part Of (Cellular Component)',
            id: AnnotonNodeType.GoCellularComponent,
            node: <AnnotonNodeDisplay>{
                category: [EntityDefinition.GoCellularComponent],
                type: AnnotonNodeType.GoCellularComponent,
                aspect: 'C',
                label: 'Part Of Cellular Component',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                treeLevel: 3,
                isExtension: true,
                weight: 20
            },
            predicate: noctuaFormConfig.edge.partOf,
            cardinality: CardinalityType.oneToOne
        },
        <InsertNodeDescription>{
            label: 'Add Part Of (Cell Type)',
            id: AnnotonNodeType.GoCellTypeEntity,
            node: <AnnotonNodeDisplay>{
                category: [EntityDefinition.GoCellTypeEntity],
                type: AnnotonNodeType.GoCellTypeEntity,
                label: 'Part Of (Cell Type)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                treeLevel: 3,
                isExtension: true,
                weight: 30
            },
            predicate: noctuaFormConfig.edge.partOf,
            cardinality: CardinalityType.oneToOne
        },
        <InsertNodeDescription>{
            label: 'Add Part Of (Anatomy)',
            id: AnnotonNodeType.GoAnatomicalEntity,
            node: <AnnotonNodeDisplay>{
                category: [EntityDefinition.GoAnatomicalEntity],
                type: AnnotonNodeType.GoAnatomicalEntity,
                label: 'Part Of (Anatomy)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                treeLevel: 3,
                isExtension: true,
                weight: 40
            },
            predicate: noctuaFormConfig.edge.partOf,
            cardinality: CardinalityType.oneToOne
        },
        <InsertNodeDescription>{
            label: 'Add Part Of (Organism)',
            id: AnnotonNodeType.GoOrganism,
            node: <AnnotonNodeDisplay>{
                category: [EntityDefinition.GoOrganism],
                type: AnnotonNodeType.GoOrganism,
                label: 'Part Of (Organism)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                treeLevel: 3,
                isExtension: true,
                weight: 50
            },
            predicate: noctuaFormConfig.edge.partOf,
            cardinality: CardinalityType.oneToOne
        }
    ],
    [AnnotonNodeType.GoCellTypeEntity]: [
        <InsertNodeDescription>{
            label: 'Add Part Of (Anatomy)',
            id: AnnotonNodeType.GoAnatomicalEntity,
            node: <AnnotonNodeDisplay>{
                category: [EntityDefinition.GoAnatomicalEntity],
                type: AnnotonNodeType.GoAnatomicalEntity,
                label: 'Part Of (Anatomy)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                treeLevel: 4,
                isExtension: true,
                weight: 40
            },
            predicate: noctuaFormConfig.edge.partOf,
            cardinality: CardinalityType.oneToOne
        },
        <InsertNodeDescription>{
            label: 'Add Part Of (Organism)',
            id: AnnotonNodeType.GoOrganism,
            node: <AnnotonNodeDisplay>{
                category: [EntityDefinition.GoOrganism],
                type: AnnotonNodeType.GoOrganism,
                label: 'Part Of (Organism)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                treeLevel: 4,
                isExtension: true,
                weight: 50
            },
            predicate: noctuaFormConfig.edge.partOf,
            cardinality: CardinalityType.oneToOne
        }
    ],
    [AnnotonNodeType.GoAnatomicalEntity]: [
        <InsertNodeDescription>{
            label: 'Add Part Of (Organism)',
            id: AnnotonNodeType.GoOrganism,
            node: <AnnotonNodeDisplay>{
                category: [EntityDefinition.GoOrganism],
                type: AnnotonNodeType.GoOrganism,
                label: 'Part Of (Organism)',
                displaySection: noctuaFormConfig.displaySection.fd,
                displayGroup: noctuaFormConfig.displayGroup.cc,
                treeLevel: 5,
                isExtension: true,
                weight: 50
            },
            predicate: noctuaFormConfig.edge.partOf,
            cardinality: CardinalityType.oneToOne
        }
    ]
};


