import axios from 'axios';
import config from '../../shared/api/config'; // adjust to wherever your new app keeps apiBaseUrl
import type {
  ModuleItem,
  PreferenceDef,
  Product,
  UserPreferenceRow,
} from './Preferences.utils';

const BASE = `${config.apiBaseUrl}/tiservice`;

export interface SavePreferenceItem {
  preferencevalue: string | null;
  preferenceid: number;
  userid: number;
  status: boolean;
  userstatus: boolean;
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const { data } = await axios.post(`${BASE}/preference/getproductpreference`, {});
    if (data.retval === 'SUCCESS') return data.productlist || [];
  } catch (error) {
    console.error('Error fetching products:', error);
  }
  return [];
}

export async function fetchModules(productId: number): Promise<ModuleItem[]> {
  try {
    const { data } = await axios.post(`${BASE}/preference/getmodulepreference`, {
      productid: productId,
    });
    if (data.retval === 'SUCCESS') return data.modulelist || [];
  } catch (error) {
    console.error('Error fetching modules:', error);
  }
  return [];
}

export async function fetchPreferences(moduleId: number): Promise<PreferenceDef[]> {
  try {
    const { data } = await axios.post(`${BASE}/preference/getpreference`, {
      moduleid: moduleId,
    });
    if (data.retval === 'SUCCESS') return data.preferencelist || [];
  } catch (error) {
    console.error('Error fetching preferences:', error);
  }
  return [];
}

// getuserpreference only takes a userid and returns ALL of the user's preferences.
export async function fetchUserPreferenceRows(
  userid: string | null
): Promise<UserPreferenceRow[] | null> {
  try {
    const { data } = await axios.post(`${BASE}/preference/getuserpreference`, { userid });
    if (data.retval === 'SUCCESS') return data.userpreference || [];
  } catch (error) {
    console.error('Error fetching user preferences:', error);
  }
  return null;
}

const ALL_EDITIONS = ['Pro', 'Prime', 'Premium'];

// Returns the editions the user is entitled to (their own and everything below it).
export async function fetchAvailableEditions(userid: string | null): Promise<string[] | null> {
  try {
    const { data } = await axios.post(`${BASE}/user/getuseredition`, {
      userid,
      moduleid: 2,
    });
    if (data.retval === 'SUCCESS') {
      const userEdition: string = data.edition[0]; // first value is the user's edition
      return ALL_EDITIONS.slice(0, ALL_EDITIONS.indexOf(userEdition) + 1);
    }
  } catch (error) {
    console.error('Error fetching editions:', error);
  }
  return null;
}

export function saveUserPreferences(preferencearray: SavePreferenceItem[]) {
  return axios.post(`${BASE}/preference/saveuserpreference`, { preferencearray });
}