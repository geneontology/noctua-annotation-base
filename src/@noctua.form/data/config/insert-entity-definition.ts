import { noctuaFormConfig } from './../../noctua-form-config';
import { Entity, AnnotonNodeDisplay } from './../../models/annoton';
import * as EntityDefinition from './entity-definition';
import { AnnotonNodeType } from './../../models/annoton/annoton-node';

declare const require: any;

export interface InsertNodeDescription {
    node: AnnotonNodeDisplay;
    predicate: Entity;
}

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


