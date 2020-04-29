export class Contributor {
    orcid: string;
    name?: string;
    group?: any = {};
    cams?: number;
    _groups?: any = [];
    token?: string;

    set groups(groups) {
        this._groups = groups;

        if (groups && groups.length > 0) {
            this.group = groups[0];
        }
    }

    get groups() {
        return this._groups;
    }
}

export function compareContributor(a: Contributor, b: Contributor): number {
    if (a.name < b.name) {
        return -1;
    } else {
        return 1;
    }
}
