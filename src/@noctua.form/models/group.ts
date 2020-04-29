export interface Group {
    url: string;
    name?: string;
    cams?: number;
    contributors?;
    contributorsCount?: number;
}

export function compareGroup(a: Group, b: Group): number {
    if (a.name < b.name) {
        return -1;
    } else {
        return 1;
    }
}