import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
  endOfMonth,
  endOfYear,
  format,
  startOfMonth,
  startOfYear,
} from 'date-fns';
import type { IREEApiClient } from '../../../domain/ports/ree-api-client.port';
import type { REEBalanceQuery } from '../../../domain/ports/ree-api-client.port';
import { ElectricBalance } from '../../../domain/entities/electric-balance';

interface REEValue {
  value: number;
  percentage: number;
  datetime: string;
}

interface REEIndicator {
  id: string;
  attributes: {
    title: string;
    composite: boolean;
    color?: string;
    magnitude?: string;
    values: REEValue[];
  };
}

interface REEGroup {
  id: string;
  attributes: {
    content: REEIndicator[];
  };
}

interface REEResponse {
  included: REEGroup[];
}

const TRANSIENT_NETWORK_ERRORS = new Set([
  'EAI_AGAIN',
  'ECONNRESET',
  'ETIMEDOUT',
  'ECONNABORTED',
]);

function getDateRange(date: string, timeTrunc: string) {
  const parsed = new Date(`${date}T00:00:00.000Z`);

  if (timeTrunc === 'month') {
    return {
      startDate: `${format(startOfMonth(parsed), 'yyyy-MM-dd')}T00:00`,
      endDate: `${format(endOfMonth(parsed), 'yyyy-MM-dd')}T23:59`,
    };
  }

  if (timeTrunc === 'year') {
    return {
      startDate: `${format(startOfYear(parsed), 'yyyy-MM-dd')}T00:00`,
      endDate: `${format(endOfYear(parsed), 'yyyy-MM-dd')}T23:59`,
    };
  }

  return {
    startDate: `${date}T00:00`,
    endDate: `${date}T23:59`,
  };
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

@Injectable()
export class REEApiClientImpl implements IREEApiClient {
  private readonly logger = new Logger(REEApiClientImpl.name);
  private readonly baseUrl =
    process.env.REE_BASE_URL ?? 'https://apidatos.ree.es';

  async fetchDailyBalance(
    date: string,
    query: REEBalanceQuery = {},
  ): Promise<ElectricBalance[]> {
    const url = `${this.baseUrl}/es/datos/balance/balance-electrico`;
    const timeTrunc = query.timeTrunc ?? 'day';
    const { startDate, endDate } = getDateRange(date, timeTrunc);
    const params: Record<string, string> = {
      start_date: startDate,
      end_date: endDate,
      time_trunc: timeTrunc,
    };

    if (query.geoTrunc && query.geoLimit && query.geoIds) {
      params.geo_trunc = query.geoTrunc;
      params.geo_limit = query.geoLimit;
      params.geo_ids = query.geoIds;
    }

    const { data } = await this.getWithRetry(url, {
      params,
      timeout: 10_000,
    });

    this.logger.log(`Fetching REE balance for ${date}`);
    const entries: ElectricBalance[] = [];

    for (const group of data.included) {
      const content = group.attributes?.content ?? [];

      for (const indicator of content) {
        for (const val of indicator.attributes.values) {
          const entryDate = val.datetime.slice(0, 10);
          entries.push(
            new ElectricBalance(
              entryDate,
              group.id,
              indicator.id,
              indicator.attributes.title,
              indicator.attributes.composite ?? false,
              val.value,
              val.percentage,
              timeTrunc,
              query.geoLimit ?? 'national',
              query.geoIds ?? 'all',
              indicator.attributes.color ?? null,
              indicator.attributes.magnitude ?? null,
            ),
          );
        }
      }
    }

    this.logger.log(`Fetched ${entries.length} entries for ${date}`);
    return entries;
  }

  private async getWithRetry(
    url: string,
    config: { params: Record<string, string>; timeout: number },
  ) {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await axios.get<REEResponse>(url, config);
      } catch (err) {
        const code = (err as { code?: string }).code;
        const shouldRetry =
          attempt < maxAttempts && code && TRANSIENT_NETWORK_ERRORS.has(code);

        if (!shouldRetry) {
          throw err;
        }

        this.logger.warn(
          `REE request failed with ${code}; retrying ${attempt}/${maxAttempts}`,
        );
        await delay(500 * attempt);
      }
    }

    throw new Error('REE request failed after retries');
  }
}
