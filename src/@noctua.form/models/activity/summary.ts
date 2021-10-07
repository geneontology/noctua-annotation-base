import { ActivityNode } from "./activity-node";
import { Entity } from "./entity";
import { Evidence } from "./evidence";

class Summary {
  label: string
  shorthand: string
  count: number = 0;
  frequency = 0
  tooltip = ''

  constructor(label?: string, shorthand?: string) {
    this.label = label ? label : null
    this.shorthand = shorthand ? shorthand : null
  }
}

export class TermSummary extends Summary {
  nodes: ActivityNode[] = []

  constructor(label?: string, shorthand?: string) {
    super(label, shorthand)
  }

  append(node: ActivityNode) {
    this.nodes.push(node)
    this.count = this.nodes.length
    this.tooltip += `${node.term.label} (${node.term.id}) \n`
  }
}

export class EvidenceSummary extends Summary {
  nodes: Evidence[] = []

  constructor(label?: string, shorthand?: string) {
    super(label, shorthand)
  }

  append(node: Evidence) {
    this.nodes.push(node)
    this.count = this.nodes.length
    this.tooltip += `${node.evidence.label} (${node.evidence.id}) \n`
  }
}

export class TermsSummary {
  bp = new TermSummary('Biological Process', 'BP');
  cc = new TermSummary('Cellular Component', 'CC');
  mf = new TermSummary('Molecular Function', 'MF');
  gp = new TermSummary('Gene Product', 'GP');
  other = new TermSummary('Other');
  evidence = new EvidenceSummary('Evidence');
  reference = new TermSummary('Reference');
  withs = new TermSummary('With/From');



  allTerms: ActivityNode[] = []

  nodes = []

  constructor() {
    this.nodes = [
      this.mf, this.bp, this.cc,
    ]
  }

}