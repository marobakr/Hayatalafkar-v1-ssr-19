import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { IGetOrders } from 'src/app/pages/profile/components/orders/res/order.interface';
import { AuthService } from '../auth/auth.service';
import { API_CONFIG } from '../conf/api.config';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _http = inject(HttpClient);
  private _authService = inject(AuthService);

  private baseUrl = API_CONFIG.BASE_URL;

  // User info state using signals
  private userInfo = signal<any>(null);

  getUserInfo(): Observable<any> {
    const userData = this._authService.getUserData();
    const userId = userData?.id || '';

    return this._http.get(
      `${this.baseUrl}${API_CONFIG.USER_MANAGEMENT.GET_USER_INFO}/${userId}`
    );
  }

  getUserOrders(): Observable<IGetOrders> {
    const userData = this._authService.getUserData();
    const userId = userData?.id || '';

    return this._http.get<IGetOrders>(
      `${this.baseUrl}${API_CONFIG.USER_MANAGEMENT.GET_USER_ORDERS}/${userId}`
    );
  }

  getUserLastOrder(): Observable<any> {
    const userData = this._authService.getUserData();
    const userId = userData?.id || '';

    return this._http.get(
      `${this.baseUrl}${API_CONFIG.USER_MANAGEMENT.GET_USER_LAST_ORDER}/${userId}`
    );
  }

  addNewAddress(addressData: any): Observable<any> {
    return this._http.post(
      `${this.baseUrl}${API_CONFIG.USER_MANAGEMENT.ADD_NEW_ADDRESS}`,
      addressData
    );
  }

  deactivateUser(): Observable<any> {
    const userData = this._authService.getUserData();
    const userId = userData?.id || '';

    return this._http.post(
      `${this.baseUrl}${API_CONFIG.USER_MANAGEMENT.DEACTIVATE_USER}${userId}`,
      {}
    );
  }

  deleteUser(): Observable<any> {
    const userData = this._authService.getUserData();
    const userId = userData?.id || '';

    return this._http.post(
      `${this.baseUrl}${API_CONFIG.USER_MANAGEMENT.DELETE_USER}${userId}`,
      {}
    );
  }

  getLocations(): Observable<any> {
    return this._http.get(
      `${this.baseUrl}${API_CONFIG.USER_MANAGEMENT.LOCATION}`
    );
  }

  updateUserInfo(userData: {
    phone: string;
    email: string;
    password: string;
  }): Observable<any> {
    return this._http.post(
      `${this.baseUrl}${API_CONFIG.USER_MANAGEMENT.UPDATE_USER_INFO}`,
      userData
    );
  }
}
