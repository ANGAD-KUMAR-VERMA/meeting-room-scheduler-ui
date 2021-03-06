import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { User } from '../_model/user.model';

import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { RestResponse } from '../_model/rest-response.model';
import { OAuth } from '../_model/o-auth.model';

import { tap } from 'rxjs/operators';
import { ConstantService } from './constant.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  //regSuccess = new Subject<boolean>();
  //sessionTimeOut = new Subject<boolean>();

  empId: string;

  showMessage:boolean;
  showAuthError:boolean;

  constructor(private httpClient: HttpClient, private cons: ConstantService) { }

  register(user: User): Observable<HttpResponse<RestResponse>> {
    console.log('Value Of User in ng : ', user);
    return this.httpClient.post<RestResponse>(this.cons.baseURI + this.cons.register, user,{ observe: 'response' });
  }


  aunthenticate(username: string, password: string): Observable<OAuth> {
    const body = new HttpParams()
      .set('username', username)
      .set('password', password)
      .set('grant_type', 'password');

    const headers = {
      'Authorization': 'Basic ' + btoa('glassdoor:glassdoor'),
      'Content-type': 'application/x-www-form-urlencoded'
    }
    console.log('Req Header : ', headers);
    console.log('Req Body : ', body);
    return this.httpClient.post<OAuth>(this.cons.baseURI + this.cons.token, body, { headers })
      .pipe(tap(token => this.saveAuthDetailsToStorage(token, username)));
  }

  getUser(empId: String): Observable<User> {
    return this.httpClient.get<User>(this.cons.baseURI + this.cons.fetchSingleUser +'/'+ empId);
  }

  private saveAuthDetailsToStorage(token: OAuth, username: string) {
    localStorage.setItem(this.cons.accessToken, token.access_token);
    localStorage.setItem(this.cons.userId, username);
  }

  public isAuthenticated(): boolean {
    const oAuthToken = localStorage.getItem(this.cons.accessToken);
    const emailId = localStorage.getItem(this.cons.userId);
    //check cookie expiry also
    if (oAuthToken != null && emailId != null) {
      return true;
    }
    return false;
  }

  logout() {
    this.deleteAuthDetailsFromStorage();
  }

  private deleteAuthDetailsFromStorage() {
    localStorage.removeItem(this.cons.accessToken);
    localStorage.removeItem(this.cons.userId);
    localStorage.removeItem(this.cons.fullName);
  }
}
