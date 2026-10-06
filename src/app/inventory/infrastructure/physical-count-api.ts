import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { PhysicalCount } from '../domain/model/physical-count.entity';
import { PhysicalCountAssembler } from './physical-count-assembler';
import { PhysicalCountResponse } from './physical-count-response';

@Service()
export class PhysicalCountApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:3000/api/v1/physicalCounts';

  getAll(): Observable<PhysicalCount[]> {
    return this.http.get<PhysicalCountResponse[]>(this.baseUrl)
      .pipe(map((responses) => PhysicalCountAssembler.toEntities(responses)));
  }

  create(count: PhysicalCount): Observable<PhysicalCount> {
    return this.http.post<PhysicalCountResponse>(this.baseUrl, PhysicalCountAssembler.toRequest(count))
      .pipe(map((response) => PhysicalCountAssembler.toEntity(response)));
  }
}
