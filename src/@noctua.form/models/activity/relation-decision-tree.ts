import vpeJson from '../../data/vpe-decision.json'


export function getVPEEdge(relationship: string, causalEffect?: string, directness?: string): string | undefined {
  const tree = vpeJson['tree'];
  if (tree[relationship]) {
    if (tree[relationship].edge) {
      return tree[relationship].edge;
    } else if (causalEffect && tree[relationship][causalEffect]) {
      if (tree[relationship][causalEffect].edge) {
        return tree[relationship][causalEffect].edge;
      } else if (directness && tree[relationship][causalEffect][directness]) {
        return tree[relationship][causalEffect][directness].edge;
      }
    }
  }
  return undefined;
}