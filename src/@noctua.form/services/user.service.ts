import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Contributor } from '../models/contributor';
import { Group } from '../models/group';


@Injectable({
  providedIn: 'root'
})
export class NoctuaUserService {
  private _baristaToken: string;
  baristaUrl = environment.globalBaristaLocation;
  onUserChanged: BehaviorSubject<any>;
  user: Contributor;
  contributors: Contributor[] = [];
  groups: Group[] = [];

  constructor(
    private httpClient: HttpClient) {
    this.onUserChanged = new BehaviorSubject(null);
  }

  set baristaToken(value) {
    this._baristaToken = value;
  }

  get baristaToken() {
    return this._baristaToken;
  }

  getUser(baristaTokenParam?: string) {
    const self = this;
    const baristaToken = baristaTokenParam ? baristaTokenParam : localStorage.getItem('barista_token');

    if (!baristaToken) {
      this.baristaToken = null;
      this.user = null;
      this.onUserChanged.next(this.user);
    } else {
      return this.httpClient.get(`${self.baristaUrl}/user_info_by_token/${baristaToken}`)
        .subscribe((response: any) => {
          if (response) {
            if (response.token) {
              this.user = new Contributor();
              this.user.name = response.nickname;
              this.user.groups = response.groups;
              this.user.token = this.baristaToken = response.token;
              localStorage.setItem('barista_token', this.baristaToken);
              this.onUserChanged.next(this.user);
            } else {
              this.user = null;
              this.baristaToken = null;
              localStorage.removeItem('barista_token');
              this.onUserChanged.next(this.user);
            }

            const url = new URL(window.location.href);
            url.searchParams.delete('barista_token');
            window.history.replaceState(null, null, url.href);
          }
        });
    }
  }


  getUsers(): Observable<any> {
    const self = this;

    return this.httpClient.get(`${self.baristaUrl}/users`);
  }

  getUserInfo(uri: string): Observable<any> {
    const self = this;

    const encodedUrl = encodeURIComponent(uri);
    return this.httpClient.get(`${self.baristaUrl}/user_info_by_id/${encodedUrl}`);
  }

  getGroups(): Observable<any> {
    const self = this;

    return this.httpClient.get(`${self.baristaUrl}/groups`);
  }

  getGroupInfo(uri: string): Observable<any> {
    const self = this;

    const encodedUrl = encodeURIComponent(uri);
    return this.httpClient.get(`${self.baristaUrl}/group_info_by_id/${encodedUrl}`);
  }

  filterContributors(value: string): any[] {
    const filterValue = value.toLowerCase();

    return this.contributors.filter((contributor: Contributor) => contributor.name.toLowerCase().indexOf(filterValue) === 0);
  }

  filterGroups(value: string): any[] {
    const filterValue = value.toLowerCase();

    return this.groups.filter((group: Group) => group.name.toLowerCase().indexOf(filterValue) === 0);
  }

  distinctUser(prev, curr) {
    if (prev && curr) {
      return prev.token === curr.token;
    } else {
      return prev === curr;
    }
  }
}
