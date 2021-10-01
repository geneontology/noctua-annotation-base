import { ActivityNode } from "./activity-node";
import { Entity } from "./entity";

export class TermSummary {
  label: string
  shorthand: string
  count: number = 0;
  frequency = 0
  tooltip = ''
  nodes: ActivityNode[] = []

  constructor(label?: string, shorthand?: string) {
    this.label = label ? label : null
    this.shorthand = shorthand ? shorthand : null
  }

  append(node: ActivityNode) {

    this.nodes.push(node)
    this.count = this.nodes.length
    this.tooltip += `${node.term.label} (${node.term.id}) \n`
  }
}

export class TermsSummary {
  bp = new TermSummary('Biological Process', 'BP');
  cc = new TermSummary('Cellular Component', 'CC');
  mf = new TermSummary('Molecular Function', 'MF');
  gp = new TermSummary('Gene Product', 'GP');
  other = new TermSummary('Other');

  allTerms: ActivityNode[] = []

  nodes = []

  constructor() {
    this.nodes = [
      this.mf, this.bp, this.cc,
    ]
  }

}