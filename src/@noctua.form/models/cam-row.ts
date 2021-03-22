
import { ActivityNode } from './../models/activity/activity-node';

export interface CamRow {
    treeLevel: number;
    expanded?: boolean,
    graph?: {};
    model?: {};
    annotatedEntity?: {};
    relationship?: string;
    aspect?: string;
    term?: {};
    relationshipExt?: string;
    extension?: {};
    evidence?: {};
    reference?: string;
    with?: string;
    assignedBy?: {};
    srcNode: ActivityNode;
    destNode: ActivityNode;
}