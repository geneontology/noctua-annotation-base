import { environment } from './../environments/environment';
import { Entity } from './models/activity/entity';

const edge = {
  placeholder: {
    id: null,
    label: null
  },
  enabledBy: {
    id: 'RO:0002333',
    label: 'enabled by'
  },
  hasInput: {
    id: 'RO:0002233',
    label: 'has input'
  },
  hasOutput: {
    id: 'RO:0002234',
    label: 'has output'
  },
  happensDuring: {
    id: 'RO:0002092',
    label: 'happens during'
  },
  locatedIn: {
    id: 'RO:0001025',
    label: 'located in'
  },
  occursIn: {
    id: 'BFO:0000066',
    label: 'occurs in'
  },
  partOf: {
    id: 'BFO:0000050',
    label: 'part of'
  },
  isActiveIn: {
    id: 'RO:0002432',
    label: 'is active in'
  },
  hasPart: {
    id: 'BFO:0000051',
    label: 'has part'
  },
  existenceOverlaps: {
    id: 'RO:0002490',
    label: 'existence overlaps'
  },
  existenceStartsEndsDuring: {
    id: 'RO:0002491',
    label: 'existence starts and ends during'
  },
  causallyUpstreamOf: {
    id: 'RO:0002411',
    label: 'causally upstream of',
  },
  causallyUpstreamOfOrWithin: {
    id: 'RO:0002418',
    label: 'causally upstream of or within',
  },
  causallyUpstreamOfPositiveEffect: {
    id: 'RO:0002304',
    label: 'causally upstream of, positive effect',
  },
  causallyUpstreamOfNegativeEffect: {
    id: 'RO:0002305',
    label: 'causally upstream of, negative effect',
  },
  causallyUpstreamOfOrWithinPositiveEffect: {
    id: 'RO:0004047',
    label: 'causally upstream of or within, positive effect',
  },
  causallyUpstreamOfOrWithinNegativeEffect: {
    id: 'RO:0004046',
    label: 'causally upstream of or within, negative effect',
  },
  directlyProvidesInput: {
    id: 'RO:0002413',
    label: 'directly provides input'
  },
  regulates: {
    id: 'RO:0002211',
    label: 'regulates'
  },
  positivelyRegulates: {
    id: 'RO:0002213',
    label: 'positively regulates'
  },
  negativelyRegulates: {
    id: 'RO:0002212',
    label: 'negatively regulates'
  },
  directlyRegulates: {
    id: 'RO:0002578',
    label: 'directly regulates'
  },
  directlyPositivelyRegulates: {
    id: 'RO:0002629',
    label: 'directly positively regulates'
  },
  directlyNegativelyRegulates: {
    id: 'RO:0002630',
    label: 'directly negatively regulates'
  },
}



export const noctuaFormConfig = {
  'activityType': {
    'options': {
      'default': {
        'name': 'default',
        'label': 'Activity Unit'
      },
      'ccOnly': {
        'name': 'ccOnly',
        'label': 'CC Annotation'
      },
      'bpOnly': {
        'name': 'bpOnly',
        'label': 'BP Annotation'
      },
      'molecule': {
        'name': 'molecule',
        'label': 'Molecule'
      }
    }
  },
  'evidenceDB': {
    'options': {
      'pmid': {
        'name': 'PMID',
        'label': 'PMID:'
      },
      'doi': {
        'name': 'DOI',
        'label': 'DOI:'
      },
      'goRef': {
        'name': 'GO_REF',
        'label': 'GO_REF:'
      }
    }
  },
  'modelState': {
    'options': {
      'development': {
        'name': 'development',
        'label': 'Development'
      },
      'production': {
        'name': 'production',
        'label': 'Production'
      },
      'review': {
        'name': 'review',
        'label': 'Review'
      },
      'closed': {
        'name': 'closed',
        'label': 'Closed'
      },
      'delete': {
        'name': 'delete',
        'label': 'Delete'
      }
    }
  },
  'causalEffect': {
    'options': {
      'positive': {
        'name': 'positive',
        'label': 'Positive',
      },
      'neutral': {
        'name': 'neutral',
        'label': 'Unknown/neutral',
      },
      'negative': {
        'name': 'negative',
        'label': 'Negative',
      },

    }
  },
  'findReplaceCategory': {
    'options': {
      'term': {
        'name': 'term',
        'label': 'Ontology Term',
      },
      'gp': {
        'name': 'gp',
        'label': 'Gene Product',
      },
      'reference': {
        'name': 'reference',
        'label': 'Reference',
      },
    }
  },
  'mechanism': {
    'options': {
      'known': {
        'name': 'known',
        'label': 'Known(regulatory)',
      },
      'unknown': {
        'name': 'unknown',
        'label': 'Unknown/Indirect',
      },
      'inputFor': {
        'name': 'inputFor',
        'label': 'Provides Input For'
      },
    }
  },
  'displaySection': {
    'gp': {
      id: 'gp',
      label: 'Gene Product'
    },
    'fd': {
      id: 'fd',
      label: 'Macromolecular Complex'
    },
  },
  'displayGroup': {
    'gp': {
      id: 'gp',
      shorthand: 'GP',
      label: 'Gene Product'
    },
    'mc': {
      id: 'mc',
      shorthand: 'MC',
      label: 'Macromolecular Complex'
    },
    'mf': {
      id: 'mf',
      shorthand: 'MF',
      label: 'Molecular Function'
    },
    'bp': {
      id: 'bp',
      shorthand: 'BP',
      label: 'Biological Process'
    },
    'cc': {
      id: 'cc',
      shorthand: 'CC',
      label: 'Location of Activity'
    }
  },
  edge: edge,
  allEdges: environment.globalKnownRelations,
  noDuplicateEdges: [
    'RO:0002333',
    'RO:0002092',
    'BFO:0000066',
    'BFO:0000050'
  ],
  canDuplicateEdges: [{
    label: 'hasPart',
    id: 'BFO:0000051'
  }],
  evidenceAutoPopulate: {
    nd: {
      evidence: {
        'id': 'ECO:0000307',
        'label': 'no biological data found used in manual assertion'
      },
      reference: 'GO_REF:0000015'
    }
  },
  rootNode: {
    mf: {
      'id': 'GO:0003674',
      'label': 'molecular_function',
      'aspect': 'F'
    },
    bp: {
      'id': 'GO:0008150',
      'label': 'biological_process',
      'aspect': 'P'
    },
    cc: {
      'id': 'GO:0005575',
      'label': 'cellular_component',
      'aspect': 'C'
    }
  },

  closures: {
    mf: {
      'id': 'GO:0003674',
    },
    bp: {
      'id': 'GO:0008150',
    },
    cc: {
      'id': 'GO:0005575',
    },
    gp: {
      'id': 'CHEBI:33695',
    },
    gpHasInput: {
      'id': 'CHEBI:23367',
    },
    mc: {
      'id': 'GO:0032991'
    },
    tp: {
      'id': 'GO:0044848'
    },
    cl: {
      'id': 'CL:0000003'
    },
    ub: {
      'id': 'CARO:0000000'
    },
    taxon: {
      'id': 'CARO:0000000'
    },
    catalyticActivity: {
      'id': 'GO:0003824'
    }
  },

  // This array is arrange for matrice decison tree for causal edge 0-8 index, don't rearrange
  causalEdges: [
    Entity.createEntity(edge.directlyNegativelyRegulates),
    Entity.createEntity(edge.directlyRegulates),
    Entity.createEntity(edge.directlyPositivelyRegulates),
    Entity.createEntity(edge.negativelyRegulates),
    Entity.createEntity(edge.regulates),
    Entity.createEntity(edge.positivelyRegulates),
    Entity.createEntity(edge.causallyUpstreamOfNegativeEffect),
    Entity.createEntity(edge.causallyUpstreamOf),
    Entity.createEntity(edge.causallyUpstreamOfPositiveEffect),
    Entity.createEntity(edge.causallyUpstreamOfOrWithinNegativeEffect),
    Entity.createEntity(edge.causallyUpstreamOfOrWithinPositiveEffect),
    Entity.createEntity(edge.causallyUpstreamOfOrWithin),
    Entity.createEntity(edge.directlyProvidesInput),
  ],

  connectorProcesses: [{
    id: 'GO:0006351',
    label: 'transcription, DNA templated',
    edge: edge.causallyUpstreamOfPositiveEffect
  }, {
    id: 'GO:0006511',
    label: 'ubiquitin-dependent protein catabolic process',
    edge: edge.negativelyRegulates
  }, {
    id: 'GO:0031623',
    label: 'receptor internalization',
    edge: edge.negativelyRegulates
  }, {
    id: 'GO:0051170',
    label: 'nuclear import',
    edge: edge.positivelyRegulates
  }],
  causalEdgeBuckets: [
    [
      edge.negativelyRegulates,
      edge.causallyUpstreamOfNegativeEffect,
    ],
    [
      edge.regulates,
      edge.causallyUpstreamOf,
    ],
    [
      edge.positivelyRegulates,
      edge.causallyUpstreamOfPositiveEffect,
    ]
  ]
};
