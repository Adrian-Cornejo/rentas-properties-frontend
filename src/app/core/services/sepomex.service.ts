import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {SepomexStateResponse,
  SepomexMunicipalityResponse,
  SepomexNeighborhoodResponse,
  SepomexNeighborhoodDetailResponse
} from '../models/sepomex/sepomex-response';
import {environment} from '../../../enviroment/environment';

@Injectable({
  providedIn: 'root'
})
export class SepomexService {
  private readonly apiUrl = `${environment.apiUrlPublic}/locations`;

  constructor(private http: HttpClient) {}

  /**
   * Obtiene todos los estados de México
   */
  getAllStates(): Observable<SepomexStateResponse[]> {
    return this.http.get<SepomexStateResponse[]>(`${this.apiUrl}/states`);
  }

  /**
   * Obtiene los municipios de un estado específico
   * @param stateId ID del estado
   */
  getMunicipalitiesByState(stateId: string): Observable<SepomexMunicipalityResponse[]> {
    const params = new HttpParams().set('stateId', stateId);
    return this.http.get<SepomexMunicipalityResponse[]>(`${this.apiUrl}/municipalities`, { params });
  }

  /**
   * Busca colonias/vecindarios con filtros opcionales
   * @param state Nombre del estado (opcional)
   * @param municipality Nombre del municipio (opcional)
   * @param query Texto de búsqueda para la colonia (opcional)
   */
  searchNeighborhoods(
    state?: string,
    municipality?: string,
    query?: string
  ): Observable<SepomexNeighborhoodResponse[]> {
    let params = new HttpParams();

    if (state) {
      params = params.set('state', state);
    }
    if (municipality) {
      params = params.set('municipality', municipality);
    }
    if (query) {
      params = params.set('query', query);
    }

    return this.http.get<SepomexNeighborhoodResponse[]>(`${this.apiUrl}/neighborhoods`, { params });
  }

  /**
   * Obtiene información detallada de colonias por código postal
   * @param postalCode Código postal de 5 dígitos
   */
  getByPostalCode(postalCode: string): Observable<SepomexNeighborhoodDetailResponse[]> {
    return this.http.get<SepomexNeighborhoodDetailResponse[]>(`${this.apiUrl}/postal-code/${postalCode}`);
  }

  /**
   * Busca colonias con información detallada
   * @param state Nombre del estado (opcional)
   * @param municipality Nombre del municipio (opcional)
   * @param query Texto de búsqueda para la colonia (opcional)
   */
  searchNeighborhoodsDetailed(
    state?: string,
    municipality?: string,
    query?: string
  ): Observable<SepomexNeighborhoodDetailResponse[]> {
    let params = new HttpParams();

    if (state) {
      params = params.set('state', state);
    }
    if (municipality) {
      params = params.set('municipality', municipality);
    }
    if (query) {
      params = params.set('query', query);
    }

    return this.http.get<SepomexNeighborhoodDetailResponse[]>(
      `${this.apiUrl}/neighborhoods/detailed`,
      { params }
    );
  }

  searchNeighborhoodsByMunicipalityCode(
    stateCode: string,
    municipalityCode: string,
    query?: string
  ): Observable<SepomexNeighborhoodDetailResponse[]> {
    let params = new HttpParams()
      .set('stateCode', stateCode)
      .set('municipalityCode', municipalityCode);

    if (query) {
      params = params.set('query', query);
    }

    const url = `${this.apiUrl}/neighborhoods/by-municipality`;

    console.log('Request URL:', url);
    console.log('Request params:', params.toString());

    return this.http.get<SepomexNeighborhoodDetailResponse[]>(url, { params });
  }
}
