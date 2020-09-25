import { Injectable } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { LeftPanel, MiddlePanel, RightPanel } from './../models/menu-panels';
import { ReviewMode } from './../models/review-mode';

@Injectable({
    providedIn: 'root'
})
export class NoctuaSearchMenuService {
    reviewMode: ReviewMode = ReviewMode.off;
    selectedLeftPanel: LeftPanel;
    selectedMiddlePanel: MiddlePanel;
    selectedRightPanel: RightPanel;

    private leftDrawer: MatDrawer;
    private rightDrawer: MatDrawer;

    constructor() {
        this.selectedLeftPanel = LeftPanel.filter;
        this.selectedMiddlePanel = MiddlePanel.cams;
    }

    selectLeftPanel(panel: LeftPanel) {
        this.selectedLeftPanel = panel;
    }

    selectMiddlePanel(panel: MiddlePanel) {
        this.selectedMiddlePanel = panel;
    }

    selectRightPanel(panel: RightPanel) {
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

    public toggleLeftDrawer(panel: LeftPanel) {
        if (this.selectedLeftPanel === panel) {
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
