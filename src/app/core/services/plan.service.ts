// src/app/core/services/plan.service.ts

import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { PlanCode, PlanFeature } from '../models/planFeatures/plan-features.model';
import { environment } from '../../../enviroment/environment';
import {PlanWithUsage, SubscriptionPlan} from '../models/planFeatures/subscription-plan';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  private readonly STORAGE_KEY = 'user_plan_data';
  private readonly PLANS_API_URL = `${environment.apiUrl}/subscription-plans`;

  // State
  private planDataSignal = signal<PlanWithUsage | null>(null);
  private planData$ = new BehaviorSubject<PlanWithUsage | null>(null);

  // Computed signals
  planCode = computed(() => this.planDataSignal()?.planCode || PlanCode.STARTER);
  planName = computed(() => this.planDataSignal()?.planName || 'Starter');

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  loadPlanFeatures(): Observable<PlanWithUsage> {
    console.log('[PlanService] Loading plan features...');

    const orgData = this.getOrganizationFromStorage();

    if (!orgData) {
      console.warn('[PlanService] No organization found in localStorage, using STARTER plan');
      const starterPlan = this.getDefaultStarterPlan();
      this.setPlanData(starterPlan);
      return of(starterPlan);
    }

    const subscriptionId = orgData.subscriptionId;

    if (!subscriptionId) {
      console.warn('[PlanService] No subscriptionId in organization, using STARTER plan');
      const starterPlan = this.getDefaultStarterPlan();
      this.setPlanData(starterPlan);
      return of(starterPlan);
    }

    console.log('[PlanService] Found subscriptionId:', subscriptionId);

    return this.http.get<SubscriptionPlan>(`${this.PLANS_API_URL}/${subscriptionId}`).pipe(
      map(plan => {
        const planWithUsage: PlanWithUsage = {
          ...plan,
          currentProperties: orgData.currentPropertiesCount || 0,
          currentUsers: orgData.currentUsersCount || 0,
          notificationsSentThisMonth: orgData.notificationsSentThisMonth || 0
        };

        console.log('[PlanService] Plan loaded:', plan.planCode);
        console.log('[PlanService] Usage:', {
          properties: planWithUsage.currentProperties,
          users: planWithUsage.currentUsers,
          notifications: planWithUsage.notificationsSentThisMonth
        });

        this.setPlanData(planWithUsage);

        return planWithUsage;
      }),
      catchError(error => {
        console.error('[PlanService] Error loading plan from API:', error);
        const starterPlan = this.getDefaultStarterPlan();
        this.setPlanData(starterPlan);
        return of(starterPlan);
      })
    );
  }

  getAllPlans(): Observable<SubscriptionPlan[]> {
    return this.http.get<SubscriptionPlan[]>(this.PLANS_API_URL).pipe(
      tap(plans => console.log('[PlanService] All plans loaded:', plans.length))
    );
  }

  getPlanById(planId: string): Observable<SubscriptionPlan> {
    return this.http.get<SubscriptionPlan>(`${this.PLANS_API_URL}/${planId}`);
  }

  getPlanByCode(planCode: string): Observable<SubscriptionPlan> {
    return this.http.get<SubscriptionPlan>(`${this.PLANS_API_URL}/code/${planCode}`);
  }

  hasFeature(featureName: string | PlanFeature): boolean {
    const plan = this.planDataSignal();
    if (!plan) {
      console.warn('[PlanService] Plan not loaded, returning false for feature:', featureName);
      return false;
    }

    // Mapear feature name a campo del plan
    const featureMap: Record<string, keyof SubscriptionPlan> = {
      'NOTIFICATIONS': 'hasNotifications',
      'MAINTENANCE_PHOTOS': 'hasMaintenancePhotos',
      'ADVANCED_REPORTS': 'hasAdvancedReports',
      'PDF_REPORTS': 'hasPdfReports',
      'DATA_EXPORT': 'hasDataExport',
      'ADMIN_DIGEST': 'hasAdminDigest',
      'LATE_REMINDERS': 'hasLateReminders',
      'WHITE_LABEL': 'hasWhiteLabel',
      'API_ACCESS': 'hasApiAccess',
      'MULTI_CURRENCY': 'hasMultiCurrency',
      'DOCUMENT_MANAGEMENT': 'hasDocumentManagement',
      'E_SIGNATURE': 'hasESignature',
      'TENANT_PORTAL': 'hasTenantPortal',
      'MOBILE_APP': 'hasMobileApp',
      'INTEGRATIONS': 'hasIntegrations',
      'MAINTENANCE_SCHEDULING': 'hasMaintenanceScheduling',
      'ALLOWS_IMAGES': 'allowsImages',
      'OVERDUE_NOTIFICATIONS': 'hasLateReminders'
    };

    // Feature especial: Multi-canal
    if (featureName === 'MULTI_CHANNEL_NOTIFICATIONS') {
      const channels = plan.notificationChannels;
      return channels === 'BOTH' || channels === 'UNLIMITED';
    }

    const fieldName = featureMap[featureName];
    if (!fieldName) {
      console.warn('[PlanService] Unknown feature:', featureName);
      return false;
    }

    return plan[fieldName] === true;
  }

  getLimit(limitName: string): number {
    const plan = this.planDataSignal();
    if (!plan) {
      console.warn('[PlanService] Plan not loaded, returning 0 for limit:', limitName);
      return 0;
    }

    const limitMap: Record<string, keyof PlanWithUsage> = {
      'maxProperties': 'maxProperties',
      'maxUsers': 'maxUsers',
      'maxActiveContracts': 'maxActiveContracts',
      'imagesPerProperty': 'imagesPerProperty',
      'monthlyNotificationLimit': 'monthlyNotificationLimit',
      'storageLimitMb': 'storageLimitMb',
      'reportHistoryDays': 'reportHistoryDays',
      'currentProperties': 'currentProperties',
      'currentUsers': 'currentUsers',
      'notificationsSentThisMonth': 'notificationsSentThisMonth'
    };

    const fieldName = limitMap[limitName];
    if (!fieldName) {
      console.warn('[PlanService] Unknown limit:', limitName);
      return 0;
    }

    return <number>plan[fieldName] ?? 0;
  }

  hasReachedLimit(resourceType: 'properties' | 'users'): boolean {
    const plan = this.planDataSignal();
    if (!plan) return true;

    if (resourceType === 'properties') {
      const current = plan.currentProperties;
      const max = plan.maxProperties;
      return max !== -1 && current >= max;
    }

    if (resourceType === 'users') {
      const current = plan.currentUsers;
      const max = plan.maxUsers;
      return max !== -1 && current >= max;
    }

    return true;
  }

  getUsage(resourceType: 'properties' | 'users'): {
    current: number;
    max: number;
    percentage: number;
    remaining: number;
    canAdd: boolean;
    isUnlimited: boolean;
  } {
    const plan = this.planDataSignal();

    if (!plan) {
      return {
        current: 0,
        max: 0,
        percentage: 100,
        remaining: 0,
        canAdd: false,
        isUnlimited: false
      };
    }

    let current = 0;
    let max = 0;

    if (resourceType === 'properties') {
      current = plan.currentProperties;
      max = plan.maxProperties;
    } else if (resourceType === 'users') {
      current = plan.currentUsers;
      max = plan.maxUsers;
    }

    const isUnlimited = max === -1;

    if (isUnlimited) {
      return {
        current,
        max: -1,
        percentage: 0,
        remaining: -1,
        canAdd: true,
        isUnlimited: true
      };
    }

    const remaining = Math.max(0, max - current);
    const percentage = max > 0 ? Math.round((current / max) * 100) : 0;

    return {
      current,
      max,
      percentage,
      remaining,
      canAdd: current < max,
      isUnlimited: false
    };
  }

  getNotificationUsage(): {
    sent: number;
    limit: number;
    remaining: number;
    percentage: number;
    canSend: boolean;
    isUnlimited: boolean;
  } {
    const plan = this.planDataSignal();

    if (!plan) {
      return {
        sent: 0,
        limit: 0,
        remaining: 0,
        percentage: 0,
        canSend: false,
        isUnlimited: false
      };
    }

    const sent = plan.notificationsSentThisMonth;
    const limit = plan.monthlyNotificationLimit;
    const isUnlimited = limit === -1;

    if (isUnlimited) {
      return {
        sent,
        limit: -1,
        remaining: -1,
        percentage: 0,
        canSend: true,
        isUnlimited: true
      };
    }

    const remaining = Math.max(0, limit - sent);
    const percentage = limit > 0 ? Math.round((sent / limit) * 100) : 0;

    return {
      sent,
      limit,
      remaining,
      percentage,
      canSend: sent < limit,
      isUnlimited: false
    };
  }

  getPlanCode(): PlanCode {
    return this.planDataSignal()?.planCode as PlanCode || PlanCode.STARTER;
  }

  getPlanName(): string {
    return this.planDataSignal()?.planName || 'Starter';
  }

  isPlan(planCode: PlanCode): boolean {
    return this.getPlanCode() === planCode;
  }

  get currentPlan$(): Observable<PlanWithUsage | null> {
    return this.planData$.asObservable();
  }

  get currentPlan() {
    return this.planDataSignal;
  }

  isLoaded(): boolean {
    return this.planDataSignal() !== null;
  }

  reload(): Observable<PlanWithUsage> {
    console.log('[PlanService] Reloading plan...');
    return this.loadPlanFeatures();
  }
  clear(): void {
    console.log('[PlanService] Clearing plan cache');
    this.planDataSignal.set(null);
    this.planData$.next(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private getOrganizationFromStorage(): any {
    try {
      // Buscar key que empiece con "organization_"
      const keys = Object.keys(localStorage);
      const orgKey = keys.find(key => key.startsWith('organization_'));

      if (!orgKey) {
        console.warn('[PlanService] No organization key found in localStorage');
        return null;
      }

      const stored = localStorage.getItem(orgKey);
      if (!stored) return null;

      const data = JSON.parse(stored);

      if (!data.organization) {
        console.warn('[PlanService] Invalid organization structure in localStorage');
        return null;
      }

      console.log('[PlanService] Organization loaded from localStorage:', data.organization.name);

      return data.organization;
    } catch (error) {
      console.error('[PlanService] Error reading organization from localStorage:', error);
      return null;
    }
  }

  private setPlanData(plan: PlanWithUsage): void {
    this.planDataSignal.set(plan);
    this.planData$.next(plan);
    this.saveToStorage(plan);
  }

  private saveToStorage(plan: PlanWithUsage): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(plan));
      console.log('[PlanService] Plan saved to localStorage');
    } catch (error) {
      console.error('[PlanService] Error saving to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const plan = JSON.parse(stored) as PlanWithUsage;
        this.planDataSignal.set(plan);
        this.planData$.next(plan);
        console.log('[PlanService] Plan loaded from storage:', plan.planCode);
      }
    } catch (error) {
      console.error('[PlanService] Error loading from storage:', error);
    }
  }
  private getDefaultStarterPlan(): PlanWithUsage {
    return {
      id: '1dad73b4-3a56-44d0-bbbb-01158b061d06',
      planCode: 'STARTER',
      planName: 'Starter',
      planDescription: 'Plan gratuito para comenzar',
      monthlyPrice: 0,
      annualPrice: 0,
      currency: 'MXN',
      trialDays: 0,
      maxProperties: 3,
      maxUsers: 1,
      maxActiveContracts: 3,
      storageLimitMb: 50,
      imagesPerProperty: 0,
      reportHistoryDays: 30,
      hasNotifications: false,
      notificationChannels: null,
      monthlyNotificationLimit: 0,
      hasLateReminders: false,
      hasAdminDigest: false,
      hasMaintenanceScheduling: false,
      hasMaintenancePhotos: false,
      hasAdvancedReports: false,
      hasDataExport: false,
      hasPdfReports: false,
      hasApiAccess: false,
      hasWhiteLabel: false,
      hasMultiCurrency: false,
      hasDocumentManagement: false,
      hasESignature: false,
      hasTenantPortal: false,
      hasMobileApp: false,
      hasIntegrations: false,
      supportLevel: 'email',
      supportResponseHours: 72,
      hasOnboarding: false,
      hasAccountManager: false,
      displayOrder: 1,
      isPopular: false,
      isCustom: false,
      unlimitedUsers: false,
      unlimitedNotifications: false,
      unlimitedHistory: false,
      allowsImages: false,
      currentProperties: 0,
      currentUsers: 0,
      notificationsSentThisMonth: 0,
      whiteLabelLevel: 'BASIC'
    };
  }
}
