
declare const require: any;
const getUuid = require('uuid/v1');

import { noctuaFormConfig } from './../../noctua-form-config';
import {
    AnnotonNode,
    AnnotonNodeType,
    AnnotonNodeDisplay
} from './../../models/annoton/annoton-node';
import { EntityLookup } from './../..//models/annoton/entity-lookup';
import { Predicate } from './../../models/annoton/predicate';


const baseRequestParams = {
    defType: 'edismax',
    indent: 'on',
    qt: 'standard',
    wt: 'json',
    rows: '10',
    start: '0',
    fl: '*,score',
    'facet': true,
    'facet.mincount': 1,
    'facet.sort': 'count',
    'facet.limit': '25',
    'json.nl': 'arrarr',
    packet: '1',
    callback_type: 'search',
    'facet.field': [
        'source',
        'subset',
        'isa_closure_label',
        'is_obsolete'
    ],
    qf: [
        'annotation_class^3',
        'annotation_class_label_searchable^5.5',
        'description_searchable^1',
        'comment_searchable^0.5',
        'synonym_searchable^1',
        'alternate_id^1',
        'isa_closure^1',
        'isa_closure_label_searchable^1'
    ],
    _: Date.now()
};

export interface GoCategory {
    id: AnnotonNodeType;
    category: string;
    categoryType: string;
}

export const GoProteinContainingComplex = {
    id: AnnotonNodeType.GoProteinContainingComplex,
    category: 'GO:0032991',
    categoryType: 'isa_closure',
} as GoCategory;

export const GoCellularComponent = {
    id: AnnotonNodeType.GoCellularComponent,
    category: 'GO:0005575',
    categoryType: 'isa_closure',
} as GoCategory;

export const GoBiologicalProcess = {
    id: AnnotonNodeType.GoBiologicalProcess,
    category: 'GO:0008150',
    categoryType: 'isa_closure',
} as GoCategory;

export const GoMolecularFunction = {
    id: AnnotonNodeType.GoMolecularFunction,
    category: 'GO:0003674',
    categoryType: 'isa_closure',
} as GoCategory;

export const GoMolecularEntity = {
    id: AnnotonNodeType.GoMolecularEntity,
    category: 'CHEBI:23367',
    categoryType: 'isa_closure',
} as GoCategory;

export const GoChemicalEntity = {
    id: AnnotonNodeType.GoChemicalEntity,
    category: 'CHEBI:24431',
    categoryType: 'isa_closure',
} as GoCategory;

export const GoEvidence = {
    id: AnnotonNodeType.GoEvidence,
    category: 'ECO:0000352',
    categoryType: 'isa_closure',
} as GoCategory;

export const GoCellTypeEntity = {
    id: AnnotonNodeType.GoCellTypeEntity,
    category: 'CL:0000003',
    categoryType: 'isa_closure',
} as GoCategory;

export const GoAnatomicalEntity = {
    id: AnnotonNodeType.GoAnatomicalEntity,
    category: 'CARO:0000000',
    categoryType: 'isa_closure',
} as GoCategory;

export const GoOrganism = {
    id: AnnotonNodeType.GoOrganism,
    category: 'NCBITaxon',
    categoryType: 'idspace',
} as GoCategory;

export const GoBiologicalPhase = {
    id: AnnotonNodeType.GoBiologicalPhase,
    category: 'GO:0044848',
    categoryType: 'isa_closure',
} as GoCategory;

export const GoCatalyticActivity = {
    id: AnnotonNodeType.GoCatalyticActivity,
    category: 'GO:0003824',
    categoryType: 'isa_closure',
} as GoCategory;


export const EntityCategories = [
    [GoProteinContainingComplex],
    [GoCellularComponent],
    [GoBiologicalProcess],
    [GoMolecularFunction],
    [GoMolecularEntity],
    [GoChemicalEntity],
    [GoEvidence],
    [GoCellTypeEntity],
    [GoAnatomicalEntity],
    [GoOrganism],
    [GoBiologicalPhase],
    // [GoCatalyticActivity]
];

export const generateBaseTerm = (goType?: string[], override: Partial<AnnotonNodeDisplay> = {}): AnnotonNode => {
    const annotonNode = new AnnotonNode();
    const predicate = new Predicate(null);

    predicate.setEvidenceMeta('eco', Object.assign({}, JSON.parse(JSON.stringify(baseRequestParams)), {
        fq: [
            'document_category:"ontology_class"',
            `isa_closure:"${GoEvidence.category}"`
        ],
    }));

    annotonNode.predicate = predicate;

    if (goType && goType.length > 0) {
        const fqCategory = (goType[0] === GoOrganism.category)
            ? `idspace:"${goType}"`
            : `isa_closure:"${goType}"`;

        annotonNode.termLookup = new EntityLookup(null,
            Object.assign({}, JSON.parse(JSON.stringify(baseRequestParams)), {
                fq: [
                    'document_category:"ontology_class"',
                    fqCategory
                ],
            })
        );
    }

    annotonNode.overrideValues(override);

    return annotonNode;
};


export const generateGoTerm = (): AnnotonNode => {
    const annotonNode = generateBaseTerm();

    annotonNode.id = 'goterm';
    annotonNode.ontologyClass = ['go'];
    annotonNode.termLookup = new EntityLookup(null,
        Object.assign({}, JSON.parse(JSON.stringify(baseRequestParams)), {
            fq: [
                'document_category:"ontology_class"',
                'isa_closure:"GO:0003674" OR isa_closure:"GO:0008150" OR isa_closure:"GO:0005575"',
            ],
        }),
    );

    return annotonNode;
};

export const generateProteinContainingComplex = (override: Partial<AnnotonNodeDisplay> = {}): AnnotonNode => {
    const annotonNode = generateBaseTerm([GoProteinContainingComplex.category]);

    annotonNode.id = GoProteinContainingComplex.id;
    annotonNode.type = GoProteinContainingComplex.id;
    annotonNode.category = [GoProteinContainingComplex.category];
    annotonNode.label = 'Macromolecular Complex';
    annotonNode.displaySection = noctuaFormConfig.displaySection.gp;
    annotonNode.displayGroup = noctuaFormConfig.displayGroup.mc;

    annotonNode.overrideValues(override);
    return annotonNode;
};

export const generateMolecularEntity = (override: Partial<AnnotonNodeDisplay> = {}): AnnotonNode => {
    const annotonNode = generateBaseTerm([GoMolecularEntity.category]);

    annotonNode.id = GoMolecularEntity.id;
    annotonNode.type = GoMolecularEntity.id;
    annotonNode.category = [GoMolecularEntity.category];
    annotonNode.label = 'Gene Product';
    annotonNode.displaySection = noctuaFormConfig.displaySection.gp;
    annotonNode.displayGroup = noctuaFormConfig.displayGroup.gp;
    annotonNode.ontologyClass = [];
    annotonNode.overrideValues(override);
    return annotonNode;
};

export const generateMolecularFunction = (override: Partial<AnnotonNodeDisplay> = {}): AnnotonNode => {
    const annotonNode = generateBaseTerm([GoMolecularFunction.category]);

    annotonNode.id = GoMolecularFunction.id;
    annotonNode.category = [GoMolecularFunction.category];
    annotonNode.label = 'Molecular Function';
    annotonNode.aspect = 'F';
    annotonNode.displaySection = noctuaFormConfig.displaySection.fd;
    annotonNode.displayGroup = noctuaFormConfig.displayGroup.mf;

    annotonNode.overrideValues(override);
    return annotonNode;
};

export const generateBiologicalProcess = (override: Partial<AnnotonNodeDisplay> = {}): AnnotonNode => {
    const annotonNode = generateBaseTerm([GoBiologicalProcess.category]);

    annotonNode.id = GoBiologicalProcess.id;
    annotonNode.category = [GoBiologicalProcess.category];
    annotonNode.label = 'MF part of Biological Process';
    annotonNode.aspect = 'P';
    annotonNode.displaySection = noctuaFormConfig.displaySection.fd;
    annotonNode.displayGroup = noctuaFormConfig.displayGroup.bp;
    annotonNode.treeLevel = 2;
    annotonNode.overrideValues(override);
    return annotonNode;
};

export const generateCellularComponent = (override: Partial<AnnotonNodeDisplay> = {}): AnnotonNode => {
    const annotonNode = generateBaseTerm([GoCellularComponent.category]);

    annotonNode.id = GoCellularComponent.id;
    annotonNode.category = [GoCellularComponent.category];
    annotonNode.label = 'MF occurs in Cellular Component';
    annotonNode.aspect = 'C';
    annotonNode.displaySection = noctuaFormConfig.displaySection.fd;
    annotonNode.displayGroup = noctuaFormConfig.displayGroup.cc;
    annotonNode.treeLevel = 2;
    annotonNode.overrideValues(override);
    return annotonNode;
};

export const generateChemicalEntity = (override: Partial<AnnotonNodeDisplay> = {}): AnnotonNode => {
    const annotonNode = generateBaseTerm([GoChemicalEntity.category]);
    annotonNode.id = GoChemicalEntity.id;
    annotonNode.category = [GoChemicalEntity.category];
    annotonNode.label = 'Has Input (GP/Chemical)';
    annotonNode.displaySection = noctuaFormConfig.displaySection.fd;
    annotonNode.displayGroup = noctuaFormConfig.displayGroup.mf;
    annotonNode.treeLevel = 3;
    annotonNode.isExtension = true;

    annotonNode.overrideValues(override);
    return annotonNode;
};

export const generateBiologicalPhase = (override: Partial<AnnotonNodeDisplay> = {}): AnnotonNode => {
    const annotonNode = generateBaseTerm([GoBiologicalPhase.category]);

    annotonNode.id = GoBiologicalPhase.id;
    annotonNode.category = [GoBiologicalPhase.category];
    annotonNode.label = 'Happens During (Temporal Phase)';
    annotonNode.displaySection = noctuaFormConfig.displaySection.fd;
    annotonNode.displayGroup = noctuaFormConfig.displayGroup.mf;
    annotonNode.treeLevel = 2;
    annotonNode.isExtension = true;
    annotonNode.overrideValues(override);
    return annotonNode;
};

export const generateCellTypeEntity = (override: Partial<AnnotonNodeDisplay> = {}): AnnotonNode => {
    const annotonNode = generateBaseTerm([GoCellTypeEntity.category]);
    annotonNode.id = GoCellTypeEntity.id;
    annotonNode.category = [GoCellTypeEntity.category];
    annotonNode.label = 'Part Of (Cell Type)';
    annotonNode.displaySection = noctuaFormConfig.displaySection.fd;
    annotonNode.displayGroup = noctuaFormConfig.displayGroup.cc;
    annotonNode.treeLevel = 3;
    annotonNode.isExtension = true;

    annotonNode.overrideValues(override);
    return annotonNode;
};

export const generateAnatomicalEntity = (override: Partial<AnnotonNodeDisplay> = {}): AnnotonNode => {
    const annotonNode = generateBaseTerm([GoAnatomicalEntity.category]);

    annotonNode.id = GoAnatomicalEntity.id;
    annotonNode.category = [GoAnatomicalEntity.category];
    annotonNode.label = 'Part Of (Anatomy)';
    annotonNode.displaySection = noctuaFormConfig.displaySection.fd;
    annotonNode.displayGroup = noctuaFormConfig.displayGroup.cc;
    annotonNode.treeLevel = 4;
    annotonNode.isExtension = true;
    annotonNode.overrideValues(override);
    return annotonNode;
};

export const generateOrganism = (override: Partial<AnnotonNodeDisplay> = {}): AnnotonNode => {
    const annotonNode = generateBaseTerm([GoOrganism.category]);

    annotonNode.id = GoOrganism.id;
    annotonNode.category = [GoOrganism.category];
    annotonNode.label = 'Part Of (Organism)';
    annotonNode.displaySection = noctuaFormConfig.displaySection.fd;
    annotonNode.displayGroup = noctuaFormConfig.displayGroup.cc;
    annotonNode.treeLevel = 5;
    annotonNode.isExtension = true;
    annotonNode.overrideValues(override);
    return annotonNode;
};

