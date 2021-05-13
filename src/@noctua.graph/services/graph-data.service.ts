import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs';

import {
    Cam,
    CamsService,
    NoctuaUserService,
    CamService,
    Activity
} from 'noctua-form-base';
import { find } from 'lodash';
import { NoctuaSearchMenuService } from './search-menu.service';
import { NoctuaConfirmDialogService } from '@noctua/components/confirm-dialog/confirm-dialog.service';


@Injectable({
    providedIn: 'root'
})
export class GraphDataSearchService {

    onArtBasketChanged: BehaviorSubject<any>;

    constructor() {

        this.onArtBasketChanged = new BehaviorSubject(null);

    }

    getLocations(cam: Cam) {
        const locations = localStorage.getItem('activityLocations');

        if (locations) {
            const activityLocations = JSON.parse(locations)
            cam.activities.forEach((activity: Activity) => {
                const activityLocation = find(activityLocations, { id: activity.id })
                if (activityLocation) {
                    activity.position.x = activityLocation.x;
                    activity.position.y = activityLocation.y
                }
            })
        }
    }

    setLocations(cam: Cam) {
        const locations = cam.activities.map((activity: Activity) => {
            return {
                id: activity.id,
                x: activity.position.x,
                y: activity.position.y
            }
        })
        localStorage.setItem('activityLocation', JSON.stringify(locations));
        // this.onArtBasketChanged.next(this.artBasket);
    }

}
