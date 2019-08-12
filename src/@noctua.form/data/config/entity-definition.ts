import { noctuaFormConfig } from './../../noctua-form-config';
import { AnnotonNode, EntityLookup, Predicate } from './../../models/annoton';

export const generateBaseTerm = (): AnnotonNode => {
    const annotonNode = new AnnotonNode();
    const predicate = new Predicate(null);

    annotonNode.predicate = predicate;

    return annotonNode;
};

export const generateGoTerm = (): AnnotonNode => {
    const annotonNode = generateBaseTerm();

    annotonNode.id = 'goterm';
    annotonNode.ontologyClass = ['go'];
    annotonNode.termLookup = new EntityLookup(null,
        Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
                'document_category:"ontology_class"',
                'isa_closure:"GO:0003674" OR isa_closure:"GO:0008150" OR isa_closure:"GO:0005575"',
            ],
        }),
    );

    return annotonNode;
};

export const generateMacromolecularComplex = (): AnnotonNode => {
    const annotonNode = generateBaseTerm();

    annotonNode.id = 'mc';
    annotonNode.label = 'Macromolecular Complex';
    annotonNode.relationship = noctuaFormConfig.edge.hasPart;
    annotonNode.displaySection = noctuaFormConfig.displaySection.gp;
    annotonNode.displayGroup = noctuaFormConfig.displayGroup.mc;
    annotonNode.lookupGroup = 'GO:0032991';
    annotonNode.ontologyClass = ['go'];
    annotonNode.termLookup = new EntityLookup(null,
        Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
                'document_category:"ontology_class"',
                'isa_closure:"GO:0032991"'
            ],
        })
    );

    return annotonNode;
};

export const generateGeneProduct = (): AnnotonNode => {
    const annotonNode = generateBaseTerm();

    annotonNode.id = 'gp';
    annotonNode.label = 'Gene Product';
    annotonNode.relationship = noctuaFormConfig.edge.enabledBy;
    annotonNode.displaySection = noctuaFormConfig.displaySection.gp;
    annotonNode.displayGroup = noctuaFormConfig.displayGroup.gp;
    annotonNode.lookupGroup = 'CHEBI:33695';
    annotonNode.ontologyClass = [];
    annotonNode.termLookup = new EntityLookup(null,
        Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
                'document_category:"ontology_class"',
                'isa_closure:"CHEBI:33695"'
            ],
        })
    );

    return annotonNode;
};


export const generateMolecularFunction = (): AnnotonNode => {
    const annotonNode = generateBaseTerm();

    annotonNode.id = 'mf';
    annotonNode.label = 'Molecular Function';
    annotonNode.aspect = 'F';
    annotonNode.relationship = noctuaFormConfig.edge.enabledBy;
    annotonNode.displaySection = noctuaFormConfig.displaySection.fd;
    annotonNode.displayGroup = noctuaFormConfig.displayGroup.mf;
    annotonNode.lookupGroup = 'GO:0003674';
    annotonNode.ontologyClass = ['go'];
    annotonNode.termLookup = new EntityLookup(null,
        Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
                'document_category:"ontology_class"',
                'isa_closure:"GO:0003674"'
            ],
        })
    );

    return annotonNode;
};

export const generateBiologicalProcess = (): AnnotonNode => {
    const annotonNode = generateBaseTerm();

    annotonNode.id = 'bp';
    annotonNode.label = 'MF part of Biological Process';
    annotonNode.aspect = 'P';
    annotonNode.relationship = noctuaFormConfig.edge.partOf;
    annotonNode.displaySection = noctuaFormConfig.displaySection.fd;
    annotonNode.displayGroup = noctuaFormConfig.displayGroup.bp;
    annotonNode.lookupGroup = 'GO:0008150';
    annotonNode.treeLevel = 2;
    annotonNode.ontologyClass = ['go'];
    annotonNode.termLookup = new EntityLookup(null,
        Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
                'document_category:"ontology_class"',
                'isa_closure:"GO:0008150"'
            ],
        })
    );

    return annotonNode;

};


export const generateCellularComponent = (): AnnotonNode => {
    const annotonNode = generateBaseTerm();

    annotonNode.id = 'cc';
    annotonNode.label = 'MF occurs in Cellular Component';
    annotonNode.aspect = 'C';
    annotonNode.relationship = noctuaFormConfig.edge.occursIn;
    annotonNode.displaySection = noctuaFormConfig.displaySection.fd;
    annotonNode.displayGroup = noctuaFormConfig.displayGroup.cc;
    annotonNode.lookupGroup = 'GO:0005575';
    annotonNode.treeLevel = 2;
    annotonNode.ontologyClass = ['go'];
    annotonNode.termLookup = new EntityLookup(null,
        Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
                'document_category:"ontology_class"',
                'isa_closure:"GO:0005575"'
            ],
        })
    );

    return annotonNode;
};

export const generateGeneProductChemical = (): AnnotonNode => {
    const annotonNode = generateBaseTerm();

    annotonNode.label = 'Has Input (Gene Product/Chemical)';
    annotonNode.relationship = noctuaFormConfig.edge.hasInput;
    annotonNode.displaySection = noctuaFormConfig.displaySection.fd;
    annotonNode.displayGroup = noctuaFormConfig.displayGroup.mf;
    annotonNode.lookupGroup = 'CHEBI:23367';
    annotonNode.treeLevel = 3;
    annotonNode.isExtension = true;
    annotonNode.ontologyClass = [];
    annotonNode.termLookup = new EntityLookup(null,
        Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
                'document_category:"ontology_class"',
                'isa_closure:"CHEBI:23367"'
            ],
        })
    );

    return annotonNode;
};

export const generateTemporalPhase = (): AnnotonNode => {
    const annotonNode = generateBaseTerm();

    annotonNode.label = 'Happens During (Temporal Phase)';
    annotonNode.relationship = noctuaFormConfig.edge.happensDuring;
    annotonNode.displaySection = noctuaFormConfig.displaySection.fd;
    annotonNode.displayGroup = noctuaFormConfig.displayGroup.mf;
    annotonNode.lookupGroup = 'GO:0044848';
    annotonNode.treeLevel = 3;
    annotonNode.isExtension = true;
    annotonNode.ontologyClass = ['go'];
    annotonNode.termLookup = new EntityLookup(null,
        Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
                'document_category:"ontology_class"',
                'isa_closure:"GO:0044848"'
            ],
        })
    );

    return annotonNode;
};

export const generateCellTyoe = (): AnnotonNode => {
    const annotonNode = generateBaseTerm();

    annotonNode.label = 'Part Of (Cell Type)';
    annotonNode.relationship = noctuaFormConfig.edge.partOf;
    annotonNode.displaySection = noctuaFormConfig.displaySection.fd;
    annotonNode.displayGroup = noctuaFormConfig.displayGroup.cc;
    annotonNode.lookupGroup = 'CL:0000003';
    annotonNode.treeLevel = 4;
    annotonNode.isExtension = true;
    annotonNode.ontologyClass = ['cl'];
    annotonNode.termLookup = new EntityLookup(null,
        Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
                'document_category:"ontology_class"',
                'isa_closure:"CL:0000003"'
            ],
        })
    );

    return annotonNode;
};


export const generateAnatomy = (): AnnotonNode => {
    const annotonNode = generateBaseTerm();

    annotonNode.label = 'Part Of (Anatomy)';
    annotonNode.relationship = noctuaFormConfig.edge.partOf;
    annotonNode.displaySection = noctuaFormConfig.displaySection.fd;
    annotonNode.displayGroup = noctuaFormConfig.displayGroup.cc;
    annotonNode.lookupGroup = 'UBERON:0000061';
    annotonNode.treeLevel = 5;
    annotonNode.isExtension = true;
    annotonNode.ontologyClass = ['uberon'];
    annotonNode.termLookup = new EntityLookup(null,
        Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
                'document_category:"ontology_class"',
                'isa_closure:"UBERON:0000061"'
            ],
        })
    );

    return annotonNode;
};
