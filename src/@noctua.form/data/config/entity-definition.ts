import {
    AnnotonNode,
    AnnotonNodeType,
    AnnotonNodeDisplay,
    GoCategory,
    categoryToClosure
} from './../../models/annoton/annoton-node';
import { EntityLookup } from './../..//models/annoton/entity-lookup';
import { Predicate } from './../../models/annoton/predicate';

const baseRequestParams = {
    defType: 'edismax',
    indent: 'on',
    qt: 'standard',
    wt: 'json',
    rows: '50',
    start: '0',
    fl: '*,score',
    'facet': true,
    'facet.mincount': 1,
    'facet.sort': 'count',
    'facet.limit': '50',
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
    category: 'CHEBI:33695',
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
    [GoChemicalEntity, GoProteinContainingComplex],
    [GoChemicalEntity, GoAnatomicalEntity, GoProteinContainingComplex]
    // [GoCatalyticActivity]
];

export const generateBaseTerm = (goCategories?: GoCategory[], override: Partial<AnnotonNodeDisplay> = {}): AnnotonNode => {
    const annotonNode = new AnnotonNode();
    const predicate = new Predicate(null);
    const fqTermCategory = categoryToClosure(goCategories);
    const fqEvidenceCategory = categoryToClosure([GoEvidence]);

    predicate.setEvidenceMeta('eco', Object.assign({}, JSON.parse(JSON.stringify(baseRequestParams)), {
        fq: [
            'document_category:"ontology_class"',
            fqEvidenceCategory
        ],
    }));

    annotonNode.predicate = predicate;

    if (goCategories && goCategories.length > 0) {
        annotonNode.termLookup = new EntityLookup(null,
            Object.assign({}, JSON.parse(JSON.stringify(baseRequestParams)), {
                fq: [
                    'document_category:"ontology_class"',
                    fqTermCategory
                ],
            })
        );
    }

    annotonNode.overrideValues(override);

    return annotonNode;
};

export const generateGOTerm = (): AnnotonNode => {
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

