import axios from 'axios';
import { REEApiClientImpl } from './ree-api-client';

jest.mock('axios');

const mockedAxios = jest.mocked(axios);

describe('REEApiClientImpl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.REE_BASE_URL = 'https://ree.test';
  });

  it('fetches daily balance with required REE params and maps the response', async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        included: [
          {
            id: 'Renovable',
            attributes: {
              content: [
                {
                  id: '10291',
                  attributes: {
                    title: 'Eólica',
                    composite: false,
                    values: [
                      {
                        value: 159629.9,
                        percentage: 0.539,
                        datetime: '2024-01-15T00:00:00.000+01:00',
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    });

    const client = new REEApiClientImpl();
    const result = await client.fetchDailyBalance('2024-01-15');

    expect(mockedAxios.get.mock.calls[0]).toEqual([
      'https://ree.test/es/datos/balance/balance-electrico',
      {
        params: {
          start_date: '2024-01-15T00:00',
          end_date: '2024-01-15T23:59',
          time_trunc: 'day',
        },
        timeout: 10_000,
      },
    ]);
    expect(result).toEqual([
      {
        date: '2024-01-15',
        groupId: 'Renovable',
        sourceId: '10291',
        sourceName: 'Eólica',
        isTotal: false,
        valueMwh: 159629.9,
        percentage: 0.539,
      },
    ]);
  });
});
