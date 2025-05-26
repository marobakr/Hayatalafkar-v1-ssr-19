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
    const userId = this._authService.getUserId();

    return this._http.get(
      `${this.baseUrl}${API_CONFIG.USER_MANAGEMENT.GET_USER_INFO}/${userId}`
    );
  }

  getUserOrders(): Observable<IGetOrders> {
    const userId = this._authService.getUserId();

    return this._http.get<IGetOrders>(
      `${this.baseUrl}${API_CONFIG.USER_MANAGEMENT.GET_USER_ORDERS}/${userId}`
    );
  }

  getUserLastOrder(): Observable<any> {
    const userId = this._authService.getUserId();

    return this._http.get(
      `${this.baseUrl}${API_CONFIG.USER_MANAGEMENT.GET_USER_LAST_ORDER}/${userId}`
    );
  }

  showOrders(userOrderId: string): Observable<any> {
    return this._http.get<IGetOrders>(
      `${this.baseUrl}${API_CONFIG.USER_MANAGEMENT.SHOW_ORDERS}/${userOrderId}`
    );
  }

  addNewAddress(addressData: any): Observable<any> {
    const userId = this._authService.getUserId();

    const data = new FormData();
    data.append('address', addressData.address);
    data.append('city', addressData.city);
    data.append('phone', addressData.phone);
    data.append('last_name', addressData.last_name);
    data.append('first_name', addressData.first_name);
    data.append('location_id', addressData.location_id);
    data.append('user_id', userId);
    return this._http.post(
      `${this.baseUrl}${API_CONFIG.USER_MANAGEMENT.ADD_NEW_ADDRESS}`,
      data
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
    name: string;
    password?: string;
  }): Observable<any> {
    const user = this._authService.getUserData();
    const userId = user?.id || '';
    const data = new FormData();
    data.append('phone', userData.phone);
    data.append('name', userData.name);
    data.append('password', userData?.password || '');
    return this._http.post(
      `${this.baseUrl}${API_CONFIG.USER_MANAGEMENT.UPDATE_USER_INFO}/${userId}`,
      data
    );
  }
}
