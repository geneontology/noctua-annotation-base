export class Gene {
  gene: string
  geneSymbol: string
  geneName: string
}

export class GeneList {
  id: string;
  description: string;
  genes: Gene[] = [];
  nonMatchingGenes: Gene[] = [];
  identifiersNotMatched: string[] = [];
  count?: number = 0
}