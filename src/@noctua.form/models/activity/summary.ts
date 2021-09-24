import { ActivityNode } from "./activity-node";
import { Entity } from "./entity";

export class TermSummary {
  label: string
  count: number = 0;
  tooltip = ''
  nodes: ActivityNode[] = []

  constructor(label?: string) {
    if (label) {
      this.label = label
    }
  }

  append(node: ActivityNode) {

    this.nodes.push(node)
    this.count = this.nodes.length
    this.tooltip += `${node.term.label} (${node.term.id}) \n`
  }
}

export class TermsSummary {
  bp = new TermSummary('BP');
  cc = new TermSummary('CC');
  mf = new TermSummary('MF');
  gp = new TermSummary('GP');
  other = new TermSummary();

  allTerms: ActivityNode[] = []

  nodes = []

  constructor() {
    this.nodes = [
      this.bp, this.cc, this.mf
    ]
  }

}