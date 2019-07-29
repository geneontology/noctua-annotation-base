import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { noctuaFormConfig } from './../../noctua-form-config';
import { noctuaFormExample } from './../..//noctua-form-examples';

import * as _ from 'lodash';

declare const require: any;

const each = require('lodash/forEach');
const uuid = require('uuid/v1');
import {
  AnnotonNode,
  Annoton,
  Evidence,
  ConnectorAnnoton,
  Entity,
  Predicate,
  AnnotonDisplay,
  NodeDisplay
} from './../../models';

@Injectable({
  providedIn: 'root'
})
export class NoctuaFormConfigService {
  baseRequestParams
  baseSpeciesRequestParam
  requestParams
  _annotonData
  _reviewSearchData
  _modelRelationship
  closureCheck;
  loggedIn: boolean = false;

  private _baristaToken;

  constructor() {

    this.baseRequestParams = {
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

    this.baseSpeciesRequestParam = {
      defType: 'edismax',
      qt: 'standard',
      indent: 'on',
      wt: 'json',
      rows: '10',
      start: '0',
      fl: 'bioentity,bioentity_name,qualifier,annotation_class,annotation_extension_json,assigned_by,taxon,evidence_type,evidence_with,panther_family,type,bioentity_isoform,reference,date,bioentity_label,annotation_class_label,taxon_label,panther_family_label,score,id',
      ' facet': true,
      'facet.mincount': 1,
      'facet.sort': 'count',
      ' json.nl': 'arrarr',
      'facet.limit': 0,
      //   hl: true
      ////    hl.simple.pre: <em class="hilite">
      //   hl.snippets: 1000
      'f.taxon_subset_closure_label.facet.limit': -1,
      'fq': 'document_category:"annotation"',
      'facet.field': ['aspect'
        , 'taxon_subset_closure_label'
        , 'type'
        , 'evidence_subset_closure_label'
        , 'regulates_closure_label'
        , 'annotation_class_label'
        , 'qualifier'
        , 'annotation_extension_class_closure_label'
        , 'assigned_by'
        , 'panther_family_label'],
      //  q: *:*
      packet: 3,
      callback_type: 'search',
    }

    this.requestParams = {
      "evidence": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
        fq: [
          'document_category:"ontology_class"',
          'isa_closure:"ECO:0000352"'
        ],
      })
    };

    this._annotonData = {
      'term': {
        'id': 'goterm',
        "label": 'Molecular Function',
        'aspect': 'F',
        "lookupGroup": 'GO:0003674',
        'treeLevel': 1,
        "ontologyClass": ['go'],
        "termLookup": {
          "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
              'document_category:"ontology_class"',
              'isa_closure:"GO:0003674" OR isa_closure:"GO:0008150" OR isa_closure:"GO:0005575"',
            ],
          }),
        },
        'searchResults': []
      },
      "mc": {
        'id': 'mc',
        "label": 'Macromolecular Complex',
        "relationship": noctuaFormConfig.edge.hasPart,
        "displaySection": noctuaFormConfig.displaySection.gp,
        "displayGroup": noctuaFormConfig.displayGroup.mc,
        "lookupGroup": 'GO:0032991',
        'treeLevel': 1,
        'isExtension': false,
        "ontologyClass": [],
        "termLookup": {
          "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
              'document_category:"ontology_class"',
              'isa_closure:"GO:0032991"'
            ],
          }),
        }
      },
      "gp": {
        "label": 'Gene Product',
        "relationship": noctuaFormConfig.edge.enabledBy,
        "displaySection": noctuaFormConfig.displaySection.gp,
        "displayGroup": noctuaFormConfig.displayGroup.gp,
        "lookupGroup": 'CHEBI:33695',
        'treeLevel': 1,
        'isExtension': false,
        "ontologyClass": [],
        "termLookup": {
          "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
              'document_category:"ontology_class"',
              'isa_closure:"CHEBI:33695"'
              //'isa_closure:"CHEBI:23367"'
            ],
          }),
        }
      },
      'mf': {
        "label": 'Molecular Function',
        'aspect': 'F',
        "relationship": noctuaFormConfig.edge.enabledBy,
        "displaySection": noctuaFormConfig.displaySection.fd,
        "displayGroup": noctuaFormConfig.displayGroup.mf,
        "lookupGroup": 'GO:0003674',
        'treeLevel': 1,
        'isExtension': false,
        "ontologyClass": ['go'],
        "termLookup": {
          "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
              'document_category:"ontology_class"',
              'isa_closure:"GO:0003674"'
            ],
          }),
        }
      },
      'mf-1': {
        "label": 'Has Input (Gene Product/Chemical)',
        "relationship": noctuaFormConfig.edge.hasInput,
        "displaySection": noctuaFormConfig.displaySection.fd,
        "displayGroup": noctuaFormConfig.displayGroup.mf,
        "lookupGroup": 'CHEBI:23367',
        'treeLevel': 2,
        'isExtension': true,
        "ontologyClass": [],
        "termLookup": {
          "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
              'document_category:"ontology_class"',
              'isa_closure:"CHEBI:23367"' //Generic Molecule + GP
            ],
          }),
        }
      },
      'mf-2': {
        "label": 'Happens During (Temporal Phase)',
        "relationship": noctuaFormConfig.edge.happensDuring,
        "displaySection": noctuaFormConfig.displaySection.fd,
        "displayGroup": noctuaFormConfig.displayGroup.mf,
        "lookupGroup": 'GO:0044848',
        'treeLevel': 2,
        'isExtension': true,
        "ontologyClass": ['go'],
        "termLookup": {
          "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
              'document_category:"ontology_class"',
              'isa_closure:"GO:0044848"'
            ],
          }),
        }
      },
      'cc': {
        "label": 'MF occurs in Cellular Component',
        'aspect': 'C',
        "relationship": noctuaFormConfig.edge.occursIn,
        "displaySection": noctuaFormConfig.displaySection.fd,
        "displayGroup": noctuaFormConfig.displayGroup.cc,
        "lookupGroup": 'GO:0005575',
        'treeLevel': 2,
        'isExtension': false,
        "ontologyClass": ['go'],
        "termLookup": {
          "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
              'document_category:"ontology_class"',
              'isa_closure:"GO:0005575"'
            ],
          }),
        }
      },
      'cc-1': {
        "label": 'Part Of (CC)',
        'aspect': 'C',
        "relationship": noctuaFormConfig.edge.partOf,
        "displaySection": noctuaFormConfig.displaySection.fd,
        "displayGroup": noctuaFormConfig.displayGroup.cc,
        "lookupGroup": 'GO:0005575',
        'treeLevel': 3,
        'isExtension': true,
        "ontologyClass": ['go'],
        "termLookup": {
          "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
              'document_category:"ontology_class"',
              'isa_closure:"GO:0005575"'
            ],
          }),
        }
      },
      'cc-1-1': {
        "label": 'Part Of (Cell Type)',
        "relationship": noctuaFormConfig.edge.partOf,
        "displaySection": noctuaFormConfig.displaySection.fd,
        "displayGroup": noctuaFormConfig.displayGroup.cc,
        "lookupGroup": 'CL:0000003',
        'treeLevel': 4,
        'isExtension': true,
        "ontologyClass": ['cl'],
        "termLookup": {
          "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
              'document_category:"ontology_class"',
              'isa_closure:"CL:0000003"'
            ],
          }),
        }
      },
      'cc-1-1-1': {
        "label": 'Part Of (Anatomy)',
        "relationship": noctuaFormConfig.edge.partOf,
        "displaySection": noctuaFormConfig.displaySection.fd,
        "displayGroup": noctuaFormConfig.displayGroup.cc,
        "lookupGroup": 'UBERON:0000061',
        'treeLevel': 5,
        'isExtension': true,
        "ontologyClass": ['uberon'],
        "termLookup": {
          "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
              'document_category:"ontology_class"',
              'isa_closure:"UBERON:0000061"'
            ],
          }),
        }
      },
      'bp': {
        "label": 'MF part of Biological Process',
        'aspect': 'P',
        "relationship": noctuaFormConfig.edge.partOf,
        "displaySection": noctuaFormConfig.displaySection.fd,
        "displayGroup": noctuaFormConfig.displayGroup.bp,
        "lookupGroup": 'GO:0008150',
        'treeLevel': 2,
        'isExtension': false,
        "ontologyClass": ['go'],
        "termLookup": {
          "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
              'document_category:"ontology_class"',
              'isa_closure:"GO:0008150"'
            ],
          }),
        }
      },
      'bp-1': {
        "label": 'Part Of (BP)',
        'aspect': 'P',
        "relationship": noctuaFormConfig.edge.partOf,
        "displaySection": noctuaFormConfig.displaySection.fd,
        "displayGroup": noctuaFormConfig.displayGroup.bp,
        "lookupGroup": 'GO:0008150',
        'treeLevel': 3,
        'isExtension': true,
        "ontologyClass": ['go'],
        "termLookup": {
          "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
              'document_category:"ontology_class"',
              'isa_closure:"GO:0008150"'
            ],
          }),
        }
      },
      'bp-1-1': {
        "label": 'Part Of (BP)',
        'aspect': 'P',
        "relationship": noctuaFormConfig.edge.partOf,
        "displaySection": noctuaFormConfig.displaySection.fd,
        "displayGroup": noctuaFormConfig.displayGroup.bp,
        "lookupGroup": 'GO:0008150',
        'treeLevel': 4,
        'isExtension': true,
        "ontologyClass": ['go'],
        "termLookup": {
          "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
              'document_category:"ontology_class"',
              'isa_closure:"GO:0008150"'
            ],
          }),
        }
      },
    }



    this._reviewSearchData = {
      "species": {
        'id': 'species',
        "label": 'Macromolecular Complex',
        "lookupGroup": 'GO:0032991',
        'treeLevel': 1,
        "ontologyClass": [],
        "termLookup": {
          "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
              'document_category:"ontology_class"',
              'isa_closure:"GO:0032991"'
            ],
          }),
        },
        'searchResults': []
      },
      "gp": {
        'id': 'gp',
        "label": 'Gene Product',
        "lookupGroup": 'CHEBI:33695',
        'treeLevel': 1,
        "ontologyClass": [],
        "termLookup": {
          "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
              'document_category:"ontology_class"',
              'isa_closure:"CHEBI:33695"'
              //'isa_closure:"CHEBI:23367"'
            ],
          }),
        },
        'searchResults': []
      },
      'goterm': {
        'id': 'goterm',
        "label": 'Molecular Function',
        'aspect': 'F',
        "lookupGroup": 'GO:0003674',
        'treeLevel': 1,
        "ontologyClass": ['go'],
        "termLookup": {
          "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
              'document_category:"ontology_class"',
              'isa_closure:"GO:0003674" OR isa_closure:"GO:0008150" OR isa_closure:"GO:0005575"',
            ],
          }),
        },
        'searchResults': []
      },
      'evidence': {
        'id': 'evidence',
        "label": 'Evidence',
        'aspect': '',
        "lookupGroup": 'ECO:0000352',
        'treeLevel': 1,
        "ontologyClass": ['go'],
        "termLookup": {
          "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
              'document_category:"ontology_class"',
              'isa_closure:"ECO:0000352"'
            ],
          }),
        },
        'searchResults': []
      },
      'contributor': {
        "label": 'Contributor',
        'aspect': 'F',
        "lookupGroup": 'GO:0003674',
        'treeLevel': 1,
        "ontologyClass": ['go'],
        "termLookup": {
          "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
              'document_category:"ontology_class"',
              'isa_closure:"GO:0003674"'
            ],
          }),
        },
        'searchResults': []
      },
      'catalyticActivity': {
        "label": 'Contributor',
        'aspect': 'F',
        "lookupGroup": 'GO:0140096',
        'treeLevel': 1,
        "ontologyClass": ['go'],
        "termLookup": {
          "requestParams": Object.assign({}, JSON.parse(JSON.stringify(this.baseRequestParams)), {
            fq: [
              'document_category:"ontology_class"',
              'isa_closure:"GO:0140096"'
            ],
          }),
        },
        'searchResults': []
      },
    }

    this._modelRelationship = {
      default: {
        nodes: [
          'gp', 'mc', 'mf', 'mf-1', 'mf-2', 'bp', 'bp-1', 'bp-1-1', 'cc', 'cc-1', 'cc-1-1', 'cc-1-1-1'
        ],
        triples: [{
          subject: 'mf',
          object: 'mc',
          edge: noctuaFormConfig.edge.enabledBy
        }, {
          subject: 'mf',
          object: 'gp',
          edge: noctuaFormConfig.edge.enabledBy
        }, {
          subject: 'mf',
          object: 'bp',
          edge: noctuaFormConfig.edge.partOf
        }, {
          subject: 'mf',
          object: 'cc',
          edge: noctuaFormConfig.edge.occursIn
        }, {
          subject: 'mf',
          object: 'mf-1',
          edge: noctuaFormConfig.edge.hasInput
        }, {
          subject: 'mf',
          object: 'mf-2',
          edge: noctuaFormConfig.edge.happensDuring
        }, {
          subject: 'bp',
          object: 'bp-1',
          edge: noctuaFormConfig.edge.partOf
        }, {
          subject: 'bp-1',
          object: 'bp-1-1',
          edge: noctuaFormConfig.edge.partOf
        }, {
          subject: 'cc',
          object: 'cc-1',
          edge: noctuaFormConfig.edge.partOf
        }, {
          subject: 'cc-1',
          object: 'cc-1-1',
          edge: noctuaFormConfig.edge.partOf
        }, {
          subject: 'cc-1-1',
          object: 'cc-1-1-1',
          edge: noctuaFormConfig.edge.partOf
        }],
        simple: {
          node: 'gp',
          triple: {
            subject: 'mf',
            object: 'gp',
            edge: noctuaFormConfig.edge.enabledBy
          }
        },
        complex: {
          node: 'mc',
          triple: {
            subject: 'mf',
            object: 'mc',
            edge: noctuaFormConfig.edge.enabledBy
          }
        }
      },
      ccOnly: {
        nodes: [
          'gp', 'mc', 'cc', 'cc-1', 'cc-1-1', 'cc-1-1-1'
        ],
        overrides: {
          'cc': {
            id: 'cc',
            label: "GP part of Cellular Component",
            relationship: noctuaFormConfig.edge.partOf
          },
          'cc-1': {
            id: 'cc-1',
            relationship: noctuaFormConfig.edge.partOf
          },
          'cc-1-1': {
            id: 'cc-1-1',
            relationship: noctuaFormConfig.edge.partOf
          }
        },
        triples: [{
          subject: 'gp',
          object: 'cc',
          edge: noctuaFormConfig.edge.partOf
        }, {
          subject: 'mc',
          object: 'cc',
          edge: noctuaFormConfig.edge.partOf
        }, {
          subject: 'cc',
          object: 'cc-1',
          edge: noctuaFormConfig.edge.partOf
        }, {
          subject: 'cc-1',
          object: 'cc-1-1',
          edge: noctuaFormConfig.edge.partOf,
        }, {
          subject: 'cc-1-1',
          object: 'cc-1-1-1',
          edge: noctuaFormConfig.edge.partOf
        }],
        simple: {
          node: 'gp',
          triple: {
            subject: 'gp',
            object: 'cc',
            edge: noctuaFormConfig.edge.partOf
          }
        },
        complex: {
          node: 'mc',
          triple: {
            subject: 'mc',
            object: 'cc',
            edge: noctuaFormConfig.edge.partOf
          }
        }
      },
      bpOnly: {
        nodes: [
          'gp', 'mc', 'mf', 'bp', 'cc-1-1', 'cc-1-1-1'
        ],
        overrides: {
          mf: {
            termRequiredList: [],
            id: 'mf',
            display: {
              displaySection: '',
              displayGroup: '',
            }
          },
          'bp': {
            id: 'bp',
            label: "Biological Process",
          },
          'cc-1-1': {
            id: 'cc-1-1',
            label: "occurs in (Cell Type)",
            relationship: noctuaFormConfig.edge.occursIn,
            display: {
              displaySection: noctuaFormConfig.displaySection.fd,
              displayGroup: noctuaFormConfig.displayGroup.bp,
            },
            treeLevel: 1
          },
          'cc-1-1-1': {
            id: 'cc-1-1-1',
            relationship: noctuaFormConfig.edge.occursIn,
            display: {
              displaySection: noctuaFormConfig.displaySection.fd,
              displayGroup: noctuaFormConfig.displayGroup.bp,
            },
            label: "occurs in (Anatomy)",
            treeLevel: 2
          },
        },
        triples: [{
          subject: 'mf',
          object: 'mc',
          edge: noctuaFormConfig.edge.enabledBy
        }, {
          subject: 'mf',
          object: 'gp',
          edge: noctuaFormConfig.edge.enabledBy
        }, {
          subject: 'bp',
          object: 'cc-1-1',
          edge: noctuaFormConfig.edge.occursIn
        }, {
          subject: 'cc-1-1',
          object: 'cc-1-1-1',
          edge: noctuaFormConfig.edge.occursIn
        }, {
          subject: 'mf',
          object: 'bp',
          edge: noctuaFormConfig.edge.causallyUpstreamOfOrWithin,
          edgeOption: {
            selected: noctuaFormConfig.edge.causallyUpstreamOfOrWithin,
            options: [
              noctuaFormConfig.edge.causallyUpstreamOfOrWithin,
              noctuaFormConfig.edge.causallyUpstreamOf,
              noctuaFormConfig.edge.causallyUpstreamOfPositiveEffect,
              noctuaFormConfig.edge.causallyUpstreamOfNegativeEffect,
              // noctuaFormConfig.edge.upstreamOfOrWithinPositiveEffect,
              //noctuaFormConfig.edge.upstreamOfOrWithinNegativeEffect,
            ]
          }
        }],
        simple: {
          node: 'gp',
          triple: {
            subject: 'mf',
            object: 'gp',
            edge: noctuaFormConfig.edge.enabledBy
          }
        },
        complex: {
          node: 'mc',
          triple: {
            subject: 'mf',
            object: 'mc',
            edge: noctuaFormConfig.edge.enabledBy
          }
        }
      },
      connector: {
        nodes: [
          'mf', 'mf'
        ],
        overrides: {
          mf: {
            termRequiredList: [],
            id: 'mf',
            display: {
              displaySection: '',
              displayGroup: '',
            }
          }
        },
        triples: [{
          subject: 'mf',
          object: 'mf',
          edge: noctuaFormConfig.edge.causallyUpstreamOfOrWithin,
          edgeOption: {
            selected: noctuaFormConfig.edge.causallyUpstreamOfOrWithin,
            options: [
              noctuaFormConfig.edge.causallyUpstreamOfOrWithin,
              noctuaFormConfig.edge.causallyUpstreamOf,
              noctuaFormConfig.edge.causallyUpstreamOfPositiveEffect,
              noctuaFormConfig.edge.causallyUpstreamOfNegativeEffect,
              noctuaFormConfig.edge.causallyUpstreamOfOrWithinPositiveEffect,
              noctuaFormConfig.edge.causallyUpstreamOfOrWithinNegativeEffect,
            ]
          }
        }],
      },
    }

    this.closureCheck = {};

    this.closureCheck[noctuaFormConfig.edge.enabledBy.id] = {
      edge: noctuaFormConfig.edge.enabledBy,
      closures: [{
        subject: noctuaFormConfig.closures.mf
      }, {
        object: noctuaFormConfig.closures.gp
      }, {
        object: noctuaFormConfig.closures.mc
      }]
    };

    this.closureCheck[noctuaFormConfig.edge.partOf.id] = {
      edge: noctuaFormConfig.edge.partOf,
      closures: [{
        subject: noctuaFormConfig.closures.bp
      }, {
        subject: noctuaFormConfig.closures.cl
      }, {
        subject: noctuaFormConfig.closures.ub
      }, {
        subject: noctuaFormConfig.closures.gp
      }, {
        object: noctuaFormConfig.closures.bp
      }, {
        object: noctuaFormConfig.closures.cl
      }, {
        object: noctuaFormConfig.closures.ub
      }, {
        object: noctuaFormConfig.closures.cc
      }]
    };

    this.closureCheck[noctuaFormConfig.edge.occursIn.id] = {
      edge: noctuaFormConfig.edge.occursIn,
      closures: [{
        object: noctuaFormConfig.closures.cc
      }, {
        object: noctuaFormConfig.closures.cl
      }, {
        object: noctuaFormConfig.closures.ub
      }, {
        subject: noctuaFormConfig.closures.bp
      }, {
        subject: noctuaFormConfig.closures.cl
      }, {
        subject: noctuaFormConfig.closures.ub
      }, {
        subject: noctuaFormConfig.closures.cc
      }, {
        subject: noctuaFormConfig.closures.mf
      }]
    };

    this.closureCheck[noctuaFormConfig.edge.hasInput.id] = {
      edge: noctuaFormConfig.edge.hasInput,
      closures: [{
        object: noctuaFormConfig.closures.gpHasInput
      }, {
        subject: noctuaFormConfig.closures.gpHasInput
      }, {
        subject: noctuaFormConfig.closures.mf
      }, {
        object: noctuaFormConfig.closures.mc
      }]
    };

    this.closureCheck[noctuaFormConfig.edge.happensDuring.id] = {
      edge: noctuaFormConfig.edge.happensDuring,
      closures: [{
        subject: noctuaFormConfig.closures.mf
      }, {
        object: noctuaFormConfig.closures.tp
      }]
    };

    this.closureCheck[noctuaFormConfig.edge.hasPart.id] = {
      edge: noctuaFormConfig.edge.hasPart,
      closures: [{
        subject: noctuaFormConfig.closures.mc
      }, {
        object: noctuaFormConfig.closures.gp
      }]
    };

    this.closureCheck[noctuaFormConfig.edge.causallyUpstreamOf.id] = {
      edge: noctuaFormConfig.edge.causallyUpstreamOf,
      closures: [{
        object: noctuaFormConfig.closures.bp
      }, {
        subject: noctuaFormConfig.closures.mf
      }]
    };

    this.closureCheck[noctuaFormConfig.edge.causallyUpstreamOfOrWithin.id] = {
      edge: noctuaFormConfig.edge.causallyUpstreamOfOrWithin,
      closures: [{
        object: noctuaFormConfig.closures.bp
      }, {
        subject: noctuaFormConfig.closures.mf
      }]
    };
  }

  set baristaToken(value) {
    this._baristaToken = value;
    localStorage.setItem('barista_token', value);
  }

  get baristaToken() {
    return this._baristaToken;
  }

  get edges() {
    return noctuaFormConfig.edge;
  }

  get modelState() {
    let options = [
      noctuaFormConfig.modelState.options.development,
      noctuaFormConfig.modelState.options.production,
      noctuaFormConfig.modelState.options.review,
      noctuaFormConfig.modelState.options.closed,
      noctuaFormConfig.modelState.options.delete
    ]

    return {
      options: options,
      selected: options[0]
    }
  }

  findModelState(name) {
    const self = this;

    return _.find(self.modelState.options, (modelState) => {
      return modelState.name === name;
    });
  }

  get closures() {
    return noctuaFormConfig.closures;
  }
  get annotonType() {
    let options = [
      noctuaFormConfig.annotonType.options.simple,
      noctuaFormConfig.annotonType.options.complex,
    ]

    return {
      options: options,
      selected: options[0]
    }
  }


  get annotonModelType() {
    let options = [
      noctuaFormConfig.annotonModelType.options.default,
      noctuaFormConfig.annotonModelType.options.bpOnly,
      noctuaFormConfig.annotonModelType.options.ccOnly,
    ]

    return {
      options: options,
      selected: options[0]
    }
  }

  get camDisplayType() {
    let options = [
      noctuaFormConfig.camDisplayType.options.model,
      noctuaFormConfig.camDisplayType.options.triple,
      noctuaFormConfig.camDisplayType.options.entity
    ]

    return {
      options: options,
      selected: options[0]
    }
  }

  get causalEffect() {
    let options = [
      noctuaFormConfig.causalEffect.options.positive,
      noctuaFormConfig.causalEffect.options.negative,
      noctuaFormConfig.causalEffect.options.neutral
    ]

    return {
      options: options,
      selected: options[0]
    }
  }

  get connectorProcess() {
    let options = noctuaFormConfig.connectorProcesses;

    return {
      options: options,
      selected: options[0]
    }
  }

  get causalReactionProduct() {
    let options = [
      noctuaFormConfig.causalReactionProduct.options.regulate,
      noctuaFormConfig.causalReactionProduct.options.substrate,
    ]

    return {
      options: options,
      selected: options[0]
    }
  }

  getCausalEffectByEdge(edge) {
    let causalEffect = noctuaFormConfig.causalEffect.options.positive;
    let annotonsConsecutive = false;

    switch (edge.id) {
      case noctuaFormConfig.edge.causallyUpstreamOfPositiveEffect.id:
        annotonsConsecutive = true
      case noctuaFormConfig.edge.directlyPositivelyRegulates.id:
        causalEffect = noctuaFormConfig.causalEffect.options.positive;
        break;
      case noctuaFormConfig.edge.causallyUpstreamOfNegativeEffect.id:
        annotonsConsecutive = true
      case noctuaFormConfig.edge.directlyNegativelyRegulates.id:
        causalEffect = noctuaFormConfig.causalEffect.options.negative;
        break;
      case noctuaFormConfig.edge.causallyUpstreamOf.id:
        annotonsConsecutive = true
      case noctuaFormConfig.edge.directlyRegulates.id:
        causalEffect = noctuaFormConfig.causalEffect.options.neutral;
        break;
    }

    return {
      causalEffect: causalEffect,
      annotonsConsecutive: annotonsConsecutive
    }
  }

  get noctuaFormExample() {
    return noctuaFormExample;
  }

  getCausalAnnotonConnectorEdge(causalEffect, annotonsConsecutive) {
    let result;

    if (annotonsConsecutive) {
      switch (causalEffect.name) {
        case noctuaFormConfig.causalEffect.options.positive.name:
          result = noctuaFormConfig.edge.causallyUpstreamOfPositiveEffect;
          break;
        case noctuaFormConfig.causalEffect.options.negative.name:
          result = noctuaFormConfig.edge.causallyUpstreamOfNegativeEffect;
          break;
        case noctuaFormConfig.causalEffect.options.neutral.name:
          result = noctuaFormConfig.edge.causallyUpstreamOf;
          break;
      }
    } else {
      switch (causalEffect.name) {
        case noctuaFormConfig.causalEffect.options.positive.name:
          result = noctuaFormConfig.edge.directlyPositivelyRegulates;
          break;
        case noctuaFormConfig.causalEffect.options.negative.name:
          result = noctuaFormConfig.edge.directlyNegativelyRegulates;
          break;
        case noctuaFormConfig.causalEffect.options.neutral.name:
          result = noctuaFormConfig.edge.directlyRegulates;
          break;
      }
    }

    return result;
  }

  getCausalAnnotonConnectorEdge2(causalEffect, annotonsConsecutive) {
    let result;

    if (annotonsConsecutive) {
      switch (causalEffect.name) {
        case noctuaFormConfig.causalEffect.options.positive.name:
          result = noctuaFormConfig.edge.causallyUpstreamOfPositiveEffect;
          break;
        case noctuaFormConfig.causalEffect.options.negative.name:
          result = noctuaFormConfig.edge.causallyUpstreamOfNegativeEffect;
          break;
        case noctuaFormConfig.causalEffect.options.neutral.name:
          result = noctuaFormConfig.edge.causallyUpstreamOf;
          break;
      }
    } else {
      switch (causalEffect.name) {
        case noctuaFormConfig.causalEffect.options.positive.name:
          result = noctuaFormConfig.edge.directlyPositivelyRegulates;
          break;
        case noctuaFormConfig.causalEffect.options.negative.name:
          result = noctuaFormConfig.edge.directlyNegativelyRegulates;
          break;
        case noctuaFormConfig.causalEffect.options.neutral.name:
          result = noctuaFormConfig.edge.directlyRegulates;
          break;
      }
    }

    return result;
  }

  getRequestParams(id) {
    const self = this;

    let nodeData = JSON.parse(JSON.stringify(self._reviewSearchData[id]));

    return nodeData.termLookup.requestParams;
  }

  getModelUrls(modelId) {
    let modelInfo: any = {};
    let baristaParams = {
      'barista_token': this.baristaToken
    }
    let modelIdParams = {
      'model_id': modelId
    }

    function parameterize(params) {
      return Object.keys(params).map(key => key + '=' + params[key]).join('&');
    }

    modelInfo.goUrl = 'http://www.geneontology.org/';
    modelInfo.noctuaUrl = environment.noctuaUrl + "?" + (this.loggedIn ? parameterize(baristaParams) : '');
    modelInfo.owlUrl = environment.noctuaUrl + "/download/" + modelId + "/owl";
    modelInfo.gpadUrl = environment.noctuaUrl + "/download/" + modelId + "/gpad";
    modelInfo.graphEditorUrl = environment.noctuaUrl + "/editor/graph/" + modelId + "?" + (this.loggedIn ? parameterize(baristaParams) : '');
    modelInfo.saeUrl = environment.workbenchUrl + 'simple-annoton-editor?' + (this.loggedIn ? parameterize(Object.assign({}, modelIdParams, baristaParams)) : '');
    // modelInfo.logoutUrl = self.baristaLocation + '/logout?' + parameterize(baristaParams) + '&amp;return=' + environment.workbenchUrl+'simple-annoton-editor?' + parameterize(baristaParams)
    // modelInfo.loginUrl = self.baristaLocation + '/login?return=' + environment.workbenchUrl+'simple-annoton-editor';

    //Workbenches 
    modelInfo.workbenches = [{
      label: 'Noctua Form',
      url: environment.workbenchUrl + 'simple-annoton-editor?' + (this.loggedIn ? parameterize(Object.assign({}, modelIdParams, baristaParams)) : parameterize(Object.assign({}, modelIdParams))),
    }, {
      label: 'Graph Editor',
      url: modelInfo.graphEditorUrl
    }, {
      label: 'Annotation Preview',
      url: environment.workbenchUrl + 'annpreview?' + (this.loggedIn ? parameterize(Object.assign({}, modelIdParams, baristaParams)) : parameterize(Object.assign({}, modelIdParams))),
    }, {
      label: 'Function Companion',
      url: environment.workbenchUrl + 'companion?' + (this.loggedIn ? parameterize(Object.assign({}, modelIdParams, baristaParams)) : parameterize(Object.assign({}, modelIdParams))),
    }, {
      label: 'Cytoscape Layout Tool',
      url: environment.workbenchUrl + 'cytoview?' + (this.loggedIn ? parameterize(Object.assign({}, modelIdParams, baristaParams)) : parameterize(Object.assign({}, modelIdParams))),
    }, {
      label: "Gosling (Noctua's little GOOSE)",
      url: environment.workbenchUrl + 'gosling-model?' + (this.loggedIn ? parameterize(Object.assign({}, modelIdParams, baristaParams)) : parameterize(Object.assign({}, modelIdParams))),
    }, {
      label: 'Inference Explanations',
      url: environment.workbenchUrl + 'inferredrelations?' + (this.loggedIn ? parameterize(Object.assign({}, modelIdParams, baristaParams)) : parameterize(Object.assign({}, modelIdParams))),
    }, {
      label: 'Macromolecular Complex Creator',
      url: environment.workbenchUrl + 'mmcc?' + (this.loggedIn ? parameterize(Object.assign({}, modelIdParams, baristaParams)) : parameterize(Object.assign({}, modelIdParams))),
    }, {
      label: 'Pathway View',
      url: environment.workbenchUrl + 'pathwayview?' + (this.loggedIn ? parameterize(Object.assign({}, modelIdParams, baristaParams)) : parameterize(Object.assign({}, modelIdParams))),
    }, {
      label: 'Annotation Preview',
      url: environment.workbenchUrl + 'simple-annoton-editor?' + (this.loggedIn ? parameterize(Object.assign({}, modelIdParams, baristaParams)) : parameterize(Object.assign({}, modelIdParams))),
    }]

    return modelInfo;
  }

  createReviewSearchFormData() {
    const self = this;

    return self._reviewSearchData;

  }

  createAnnotonConnectorModel(upstreamAnnoton: Annoton, downstreamAnnoton: Annoton, srcProcessNode?: AnnotonNode, srcHasInputNode?: AnnotonNode) {
    const self = this;
    const srcUpstreamNode = upstreamAnnoton.getMFNode();
    const srcDownstreamNode = downstreamAnnoton.getMFNode();
    const upstreamNode = self.generateNode(srcUpstreamNode.id, { id: 'upstream' });
    const downstreamNode = self.generateNode(srcDownstreamNode.id, { id: 'downstream' });
    const processNode = srcProcessNode ? srcProcessNode : self.generateNode('bp', { id: 'process' });
    const hasInputNode = srcHasInputNode ? srcHasInputNode : self.generateNode('mf-1', { id: 'has-input' });

    upstreamNode.copyValues(srcUpstreamNode);
    downstreamNode.copyValues(srcDownstreamNode);

    const connectorAnnoton = new ConnectorAnnoton(upstreamNode, downstreamNode);

    // connectorAnnoton.addNodes(upstreamNode, downstreamNode, processNode, hasInputNode);
    connectorAnnoton.upstreamAnnoton = upstreamAnnoton;
    connectorAnnoton.downstreamAnnoton = downstreamAnnoton;
    connectorAnnoton.processNode = processNode;
    connectorAnnoton.hasInputNode = hasInputNode;

    return connectorAnnoton;
  }

  createAnnotonModel(annotonType, modelType, srcAnnoton?) {
    const self = this;
    const annoton = new AnnotonDisplay();
    const modelIds = _.cloneDeep(self._modelRelationship);

    annoton.setAnnotonType(annotonType);
    annoton.setAnnotonModelType(modelType);

    each(modelIds[modelType].nodes, function (id) {
      const predicate = new Predicate();
      const nodeDisplay = self.generateNode(id);

      predicate.setEvidenceMeta('eco', self.requestParams['evidence']);
      nodeDisplay.predicate = predicate;
      annoton.addNode(nodeDisplay);
    });

    each(modelIds[modelType].triples, function (triple) {
      const predicate = new Predicate(triple.edge);

      //  predicate.setEvidenceMeta('eco', self.requestParams['evidence']);
      //  annoton.addEdgeById(triple.subject, triple.object, predicate);
    });

    if (srcAnnoton) {
      // annoton.copyValues(srcAnnoton);
    }

    each(modelIds[modelType].overrides, function (overridesData) {
      const node: NodeDisplay = annoton.getNode(overridesData.id);

      overridesData.isExtension ? node.isExtension = overridesData.isExtension : null;
      overridesData.treeLevel ? node.treeLevel = overridesData.treeLevel : null;
      overridesData.termRequiredList ? node.termRequiredList = overridesData.termRequiredList : null;
      overridesData.term ? node.term = overridesData.term : null;
      overridesData.display ? node.setDisplay(overridesData.display) : null;
      overridesData.label ? node.label = overridesData.label : null;
      overridesData.relationship ? node.relationship = overridesData.relationship : null;
    });

    annoton.enableSubmit();
    return annoton;
  }


  generateNode(id?, overrides?): NodeDisplay {
    const self = this;

    const nodeDataObject = self._annotonData[id];
    const nodeDisplay = new NodeDisplay();
    const nodeData = nodeDataObject ?
      JSON.parse(JSON.stringify(nodeDataObject)) :
      JSON.parse(JSON.stringify(self._annotonData['term']));

    nodeDisplay.id = (overrides && overrides.id) ? overrides.id : id;
    nodeDisplay.aspect = nodeData.aspect;
    nodeDisplay.ontologyClass = nodeData.ontologyClass;
    nodeDisplay.label = nodeData.label;
    nodeDisplay.relationship = nodeData.relationship;
    nodeDisplay.displaySection = (overrides && overrides.displaySection) ? overrides.displaySection : nodeData.displaySection;
    nodeDisplay.displayGroup = nodeData.displayGroup;
    nodeDisplay.lookupGroup = nodeData.lookupGroup;
    nodeDisplay.treeLevel = nodeData.treeLevel;
    nodeDisplay.isExtension = nodeData.isExtension;
    nodeDisplay.setTermLookup(nodeData.termLookup.requestParams);
    nodeDisplay.setTermOntologyClass(nodeData.ontologyClass);

    return nodeDisplay;
  }

  createAnnotonModelFakeData(nodes) {
    const self = this;

    let annoton = self.createAnnotonModel(
      noctuaFormConfig.annotonType.options.simple.name,
      noctuaFormConfig.annotonModelType.options.default.name
    );

    nodes.forEach((node) => {
      let annotonNode = annoton.getNode(node.id);
      let destEvidences: Evidence[] = []

      annotonNode.term = new Entity(node.term.id, node.term.label);

      each(node.evidence, (evidence) => {
        let destEvidence: Evidence = new Evidence();

        destEvidence.evidence = new Entity(evidence.evidence.id, evidence.evidence.label);
        destEvidence.reference = evidence.reference;
        destEvidence.with = evidence.with;

        destEvidences.push(destEvidence)
      });

      //annotonNode.setEvidence(destEvidences);
    });

    annoton.enableSubmit();
    return annoton;
  }

  findEdge(predicateId) {
    _.find(noctuaFormConfig.edge, {
      id: predicateId
    })
  }

  createJoyrideSteps() {
    const self = this;

    let steps = [{
      type: 'element',
      selector: "#noc-model-section",
      title: "Model Creation",
      content: `Define model's title and state. <a target="_blank" href="http://wiki.geneontology.org/index.php/Noctua#Starting_a_new_model">more</a>`,
      placement: 'bottom'
    }, {
      type: 'element',
      selector: "#noc-gp-section",
      title: "Enter gene product",
      content: `Enter gene product or macromolecular complex to be annotated <a target="_blank" href="http://wiki.geneontology.org/index.php/Noctua#Starting_a_new_model">more</a>`,
      placement: 'bottom'
    }, {
      type: 'element',
      selector: "#noc-gp-toggle-button",
      title: "Select",
      content: `Toggle between gene product or macromolecular complex <a target="_blank" href="http://wiki.geneontology.org/index.php/Noctua#Starting_a_new_model">more</a>`,
      placement: 'left'
    }, {
      type: 'element',
      selector: "#noc-fd-section",
      title: "Enter Molecular Function",
      content: `Enter the molecular function, evidence, and reference. Then enter other optional fields <a target="_blank" href="http://wiki.geneontology.org/index.php/Noctua#Starting_a_new_model">more</a>`,
      placement: 'top'
    }, {
      type: 'element',
      selector: "#noc-submit-row",
      title: "Create The Activity",
      content: 'Check if there are any errors (create button not greyed out). Add the new activity to a model. <a href="http://wiki.geneontology.org/index.php/Noctua#Starting_a_new_model">more</a>',
      placement: 'top'
    }, {
      type: 'element',
      selector: "#noc-start-model-button",
      title: "Model Creation",
      content: `You can also start a new model <a target="_blank" href="http://wiki.geneontology.org/index.php/Noctua#Starting_a_new_model">more</a>`,
      placement: 'left'
    }, {
      type: 'element',
      selector: "#noc-molecular-activities",
      title: "Molecular Activities in the Model",
      content: 'This is where all the molecular activities in this model appear.',
      placement: 'top'
    }];

    return steps;
  }

  getAspect(id) {
    const rootNode = _.find(noctuaFormConfig.rootNode, { id: id });

    return rootNode ? rootNode.aspect : '';
  }

  getModelId(url: string) {
    return 'gomodel:' + url.substr(url.lastIndexOf('/') + 1)
  }

  getIndividalId(url: string) {
    return 'gomodel:' + url.substr(url.lastIndexOf('/') + 2)
  }
}