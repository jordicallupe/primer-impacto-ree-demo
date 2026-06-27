import {
  BadRequestException,
  Controller,
  Get,
  Query,
  ServiceUnavailableException,
} from '@nestjs/common';
import { z } from 'zod';
import { GetBalanceUseCase } from '../../domain/use-cases/get-balance.use-case';
import { SyncFromREEUseCase } from '../../domain/use-cases/sync-from-ree.use-case';
import { format, toZonedTime } from 'date-fns-tz';
import { subDays } from 'date-fns';

const isoDateSchema = z
  .string({
    error: (issue) =>
      issue.input === undefined ? 'is required' : 'must use YYYY-MM-DD format',
  })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'must use YYYY-MM-DD format')
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(parsed.getTime()) &&
      value === parsed.toISOString().slice(0, 10)
    );
  }, 'must be a valid calendar date');

const rangeQuerySchema = z
  .object({
    from: isoDateSchema,
    to: isoDateSchema,
    timeTrunc: z.enum(['day', 'month', 'year']).optional(),
    geoLimit: z
      .enum([
        'national',
        'peninsular',
        'canarias',
        'baleares',
        'ceuta',
        'melilla',
      ])
      .optional(),
    geoIds: z.string().optional(),
  })
  .refine(({ from, to }) => from <= to, {
    message: 'from must be earlier than or equal to to',
    path: ['from'],
  });

const syncQuerySchema = z.object({
  date: isoDateSchema.optional(),
  timeTrunc: z.enum(['day', 'month', 'year']).optional(),
  geoLimit: z
    .enum([
      'national',
      'peninsular',
      'canarias',
      'baleares',
      'ceuta',
      'melilla',
    ])
    .optional(),
  geoIds: z.string().optional(),
});

type RangeQuery = z.infer<typeof rangeQuerySchema>;
type SyncQuery = z.infer<typeof syncQuerySchema>;

function parseQuery<T extends z.ZodType>(
  schema: T,
  query: unknown,
): z.infer<T> {
  const result = schema.safeParse(query);

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new BadRequestException(message);
  }

  return result.data;
}

@Controller('balance')
export class BalanceController {
  constructor(
    private readonly getBalance: GetBalanceUseCase,
    private readonly syncUseCase: SyncFromREEUseCase,
  ) {}

  @Get()
  async getRange(
    @Query('from') from: string,
    @Query('to') to: string,
    @Query('timeTrunc') timeTrunc?: string,
    @Query('geoLimit') geoLimit?: string,
    @Query('geoIds') geoIds?: string,
  ) {
    const query: RangeQuery = parseQuery(rangeQuerySchema, {
      from,
      to,
      timeTrunc,
      geoLimit,
      geoIds,
    });

    return this.getBalance.execute(query.from, query.to, {
      timeTrunc: query.timeTrunc ?? 'day',
      geoLimit: query.geoLimit ?? 'national',
      geoIds: query.geoIds ?? 'all',
    });
  }

  @Get('sync')
  async syncToday(
    @Query('date') date?: string,
    @Query('timeTrunc') timeTrunc?: string,
    @Query('geoLimit') geoLimit?: string,
    @Query('geoIds') geoIds?: string,
  ) {
    const madrid = toZonedTime(new Date(), 'Europe/Madrid');
    const syncQuery: SyncQuery = parseQuery(syncQuerySchema, {
      date,
      timeTrunc,
      geoLimit,
      geoIds,
    });
    const target = syncQuery.date ?? format(subDays(madrid, 1), 'yyyy-MM-dd');
    const result = await this.syncUseCase.execute(target, {
      timeTrunc: syncQuery.timeTrunc ?? 'day',
      ...(syncQuery.geoLimit && syncQuery.geoIds
        ? {
            ...(syncQuery.geoLimit === 'national'
              ? {}
              : {
                  geoTrunc: 'electric_system' as const,
                  geoLimit: syncQuery.geoLimit,
                  geoIds: syncQuery.geoIds,
                }),
          }
        : {}),
    });

    if (!result.success) {
      throw new ServiceUnavailableException({
        message: 'Could not sync data from REE',
        date: target,
        reason: result.error,
      });
    }

    return { synced: true, date: target, entries: result.entries };
  }
}
