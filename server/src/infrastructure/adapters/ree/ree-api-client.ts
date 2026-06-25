import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import type { IREEApiClient } from '../../../domain/ports/ree-api-client.port';
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

@Injectable()
export class REEApiClientImpl implements IREEApiClient {
  private readonly logger = new Logger(REEApiClientImpl.name);
  private readonly baseUrl =
    process.env.REE_BASE_URL ?? 'https://apidatos.ree.es';

  async fetchDailyBalance(date: string): Promise<ElectricBalance[]> {
    const url = `${this.baseUrl}/es/datos/balance/balance-electrico`;
    const { data } = await axios.get<REEResponse>(url, {
      params: {
        start_date: `${date}T00:00`,
        end_date: `${date}T23:59`,
        time_trunc: 'day',
      },
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
            ),
          );
        }
      }
    }

    this.logger.log(`Fetched ${entries.length} entries for ${date}`);
    return entries;
  }
}
