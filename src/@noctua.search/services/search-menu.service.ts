import { Injectable } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { ReviewMode } from './../models/review-mode';

@Injectable({
    providedIn: 'root'
})
export class NoctuaSearchMenuService {
    leftPanel = {
        search: {
            id: 1
        }, filter: {
            id: 2
        }, relation: {
            id: 3
        }, group: {
            id: 4
        }, contributor: {
            id: 5
        }, organism: {
            id: 6
        }, history: {
            id: 7
        }, replace: {
            id: 8
        }
    };

    middlePanel = {
        cams: {
            id: 1
        },
        camsReview: {
            id: 2
        }
    };

    rightPanel = {
        camForm: {
            id: 1
        }, connectorForm: {
            id: 2
        }, annotonForm: {
            id: 3
        }, annotonEntityForm: {
            id: 4
        }, camTable: {
            id: 5
        }, camsReview: {
            id: 6
        }, camsReplace: {
            id: 7
        }, camDetail: {
            id: 8
        }
    };

    reviewMode: ReviewMode = ReviewMode.off;

    selectedLeftPanel;
    selectedMiddlePanel;
    selectedRightPanel;

    private leftDrawer: MatDrawer;
    private rightDrawer: MatDrawer;

    constructor() {
        this.selectedLeftPanel = this.leftPanel.filter;
        this.selectedMiddlePanel = this.middlePanel.cams;
        this.selectedRightPanel = this.rightPanel.annotonEntityForm;
    }

    selectLeftPanel(panel) {
        this.selectedLeftPanel = panel;
    }

    selectMiddlePanel(panel) {
        this.selectedMiddlePanel = panel;
    }

    selectRightPanel(panel) {
        this.selectedRightPanel = panel;
    }

    public setLeftDrawer(leftDrawer: MatDrawer) {
        this.leftDrawer = leftDrawer;
    }

    public openLeftDrawer() {
        return this.leftDrawer.open();
    }

    public closeLeftDrawer() {
        return this.leftDrawer.close();
    }

    public toggleLeftDrawer(panel) {
        if (this.selectedLeftPanel.id === panel.id) {
            this.leftDrawer.toggle();
        } else {
            this.selectLeftPanel(panel);
            return this.openLeftDrawer();
        }
    }

    public setRightDrawer(rightDrawer: MatDrawer) {
        this.rightDrawer = rightDrawer;
    }

    public openRightDrawer() {
        return this.rightDrawer.open();
    }

    public closeRightDrawer() {
        return this.rightDrawer.close();
    }
}
