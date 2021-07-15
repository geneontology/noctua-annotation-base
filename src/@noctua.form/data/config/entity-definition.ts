import {
    ActivityNode,
    ActivityNodeType,
    ActivityNodeDisplay,
    GoCategory,
    categoryToClosure
} from './../../models/activity/activity-node';
import { EntityLookup } from './../..//models/activity/entity-lookup';
import { Predicate } from './../../models/activity/predicate';

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
    id: ActivityNodeType.GoProteinContainingComplex,
    category: 'GO:0032991',
    categoryType: 'isa_closure',
} as GoCategory;

export const GoCellularComponent = {
    id: ActivityNodeType.GoCellularComponent,
    category: 'GO:0005575',
    categoryType: 'isa_closure',
    suffix: `OR NOT ${GoProteinContainingComplex.categoryType}:"${GoProteinContainingComplex.category}"`,
} as GoCategory;

export const GoCellularAnatomical = {
    id: ActivityNodeType.GoCellularAnatomical,
    category: 'GO:0110165',
    categoryType: 'isa_closure',
} as GoCategory;

export const GoBiologicalProcess = {
    id: ActivityNodeType.GoBiologicalProcess,
    category: 'GO:0008150',
    categoryType: 'isa_closure',
} as GoCategory;

export const GoMolecularFunction = {
    id: ActivityNodeType.GoMolecularFunction,
    category: 'GO:0003674',
    categoryType: 'isa_closure',
} as GoCategory;

export const GoMolecularEntity = {
    id: ActivityNodeType.GoMolecularEntity,
    category: 'CHEBI:33695',
    categoryType: 'isa_closure',
} as GoCategory;

export const GoChemicalEntity = {
    id: ActivityNodeType.GoChemicalEntity,
    category: 'CHEBI:24431',
    categoryType: 'isa_closure',
} as GoCategory;

export const GoEvidence = {
    id: ActivityNodeType.GoEvidence,
    category: 'ECO:0000352',
    categoryType: 'isa_closure',
} as GoCategory;

export const GoCellTypeEntity = {
    id: ActivityNodeType.GoCellTypeEntity,
    category: 'CL:0000003',
    categoryType: 'isa_closure',
} as GoCategory;

export const GoAnatomicalEntity = {
    id: ActivityNodeType.GoAnatomicalEntity,
    category: 'CARO:0000000',
    categoryType: 'isa_closure',
} as GoCategory;

export const GoOrganism = {
    id: ActivityNodeType.GoOrganism,
    category: 'NCBITaxon',
    categoryType: 'idspace',
} as GoCategory;

export const GoBiologicalPhase = {
    id: ActivityNodeType.GoBiologicalPhase,
    category: 'GO:0044848',
    categoryType: 'isa_closure',
} as GoCategory;

export const GoCatalyticActivity = {
    id: ActivityNodeType.GoCatalyticActivity,
    category: 'GO:0003824',
    categoryType: 'isa_closure',
} as GoCategory;

export const EntityCategories = [
    [GoProteinContainingComplex],
    [GoCellularComponent],
    [GoCellularAnatomical],
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

export const generateBaseTerm = (goCategories?: GoCategory[], override: Partial<ActivityNodeDisplay> = {}): ActivityNode => {
    const activityNode = new ActivityNode();
    const predicate = new Predicate(null);
    const fqTermCategory = categoryToClosure(goCategories);
    const fqEvidenceCategory = categoryToClosure([GoEvidence]);

    predicate.setEvidenceMeta('eco', Object.assign({}, JSON.parse(JSON.stringify(baseRequestParams)), {
        fq: [
            'document_category:"ontology_class"',
            fqEvidenceCategory
        ],
    }));

    activityNode.predicate = predicate;

    if (goCategories && goCategories.length > 0) {
        activityNode.termLookup = new EntityLookup(null,
            Object.assign({}, JSON.parse(JSON.stringify(baseRequestParams)), {
                fq: [
                    'document_category:"ontology_class"',
                    fqTermCategory
                ],
            })
        );
    }

    activityNode.overrideValues(override);

    return activityNode;
};

export const generateGOTerm = (): ActivityNode => {
    const activityNode = generateBaseTerm();

    activityNode.id = 'goterm';
    activityNode.ontologyClass = ['go'];
    activityNode.termLookup = new EntityLookup(null,
        Object.assign({}, JSON.parse(JSON.stringify(baseRequestParams)), {
            fq: [
                'document_category:"ontology_class"',
                'isa_closure:"GO:0003674" OR isa_closure:"GO:0008150" OR isa_closure:"GO:0005575"',
            ],
        }),
    );

    return activityNode;
};

export const setEvidenceLookup = (predicate: Predicate): void => {
    const fqEvidenceCategory = categoryToClosure([GoEvidence]);

    predicate.setEvidenceMeta('eco', Object.assign({}, JSON.parse(JSON.stringify(baseRequestParams)), {
        fq: [
            'document_category:"ontology_class"',
            fqEvidenceCategory
        ],
    }));
};

