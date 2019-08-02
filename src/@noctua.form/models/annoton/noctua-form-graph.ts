import { find, omit, pickBy, mapKeys, mapValues, remove } from 'lodash';

export type Edge<EdgeMetadata> = { subjectId: string, objectId: string, metadata: EdgeMetadata };
export interface Graph<Node, EdgeMetadata> {
    _nodes: { [key: string]: Node };
    _edges: { [key: string]: Edge<EdgeMetadata>[] };
}

export const empty = () => ({ _nodes: {}, _edges: {} });

export function addNode<Node, EdgeMetadata>(
    graph: Graph<Node, EdgeMetadata>,
    node: Node,
    key: string
): Graph<Node, EdgeMetadata> {
    graph._nodes[key] = node;
    graph._edges[key] = [];
    return graph;
}

export function findNode<Node, EdgeMetadata>(
    graph: Graph<Node, EdgeMetadata>,
    key: string
): Node | null {
    return graph._nodes[key];
}

export function removeNode<Node, EdgeMetadata>(
    graph: Graph<Node, EdgeMetadata>,
    key: string
) {
    delete graph._nodes[key];
}

export function getNodes<Node, EdgeMetadata>(
    graph: Graph<Node, EdgeMetadata>
): Record<string, Node> {
    return graph._nodes;
}

export function getEdges<Node, EdgeMetadata>(
    graph: Graph<Node, EdgeMetadata>,
    key?: string
): Edge<EdgeMetadata>[] {

    if (key) return graph._edges[key];

    let edges: Edge<EdgeMetadata>[] = [];

    Object.keys(graph._edges).forEach((key) => {
        edges.push(...graph._edges[key])
    })

    return edges;
}

export function addEdge<Node, EdgeMetadata>(
    graph: Graph<Node, EdgeMetadata>,
    edge: Edge<EdgeMetadata>,
): Graph<Node, EdgeMetadata> {
    graph._edges[edge.subjectId].push(edge);
    return graph;
}

export function findEdge<Node, EdgeMetadata>(
    graph: Graph<Node, EdgeMetadata>,
    edge: Edge<EdgeMetadata>
): Edge<EdgeMetadata> {
    return find(graph._edges[edge.subjectId], (e: Edge<EdgeMetadata>) => {
        return e.objectId === edge.objectId;
    });
}

export function removeEdge<Node, EdgeMetadata>(
    graph: Graph<Node, EdgeMetadata>,
    edge: Edge<EdgeMetadata>
): Graph<Node, EdgeMetadata> {
    remove(graph._edges[edge.subjectId], (e: Edge<EdgeMetadata>) => {
        return e.objectId === edge.objectId;
    })
    return graph;
}
