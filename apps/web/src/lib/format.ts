import { formatMoney as sdkFormatMoney } from '@assetlane/theme-sdk';
import { getActiveLocale } from '../i18n/locale-state';
import { intlLocaleForLocale } from '../i18n/types';

export const formatMoney = (amount: number, currency: string) =>
  sdkFormatMoney(amount, currency, intlLocaleForLocale(getActiveLocale()));
