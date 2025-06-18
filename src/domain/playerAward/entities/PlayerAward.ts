// src/domain/playerAward/entities/PlayerAward.ts


import { ValidationError } from '@/shared/errors/AppError';

export interface PlayerAwardProps {
  id?: number;
  playerId: number;
  awardName?: string;
  yearAwarded?: number;
}

export class PlayerAward {
  private constructor(private props: PlayerAwardProps) {
    this.validate();
  }

  public static create(props: PlayerAwardProps): PlayerAward {
    return new PlayerAward(props);
  }

  public static fromPersistence(data: {
    id: number;
    playerId: number;
    awardName?: string | null;
    yearAwarded?: number | null;
  }): PlayerAward {
    return new PlayerAward({
      id: data.id,
      playerId: data.playerId,
      awardName: data.awardName || undefined,
      yearAwarded: data.yearAwarded || undefined,
    });
  }

  private validate(): void {
    if (!this.props.playerId || this.props.playerId <= 0) {
      throw new ValidationError('Player ID is required and must be positive');
    }

    if (this.props.awardName && this.props.awardName.length > 45) {
      throw new ValidationError('Award name cannot exceed 45 characters');
    }

    if (this.props.yearAwarded && (this.props.yearAwarded < 1950 || this.props.yearAwarded > 2030)) {
      throw new ValidationError('Year awarded must be between 1950 and 2030');
    }
  }

  // Getters
  public get id(): number | undefined {
    return this.props.id;
  }

  public get playerId(): number {
    return this.props.playerId;
  }

  public get awardName(): string | undefined {
    return this.props.awardName;
  }

  public get yearAwarded(): number | undefined {
    return this.props.yearAwarded;
  }

  // Business methods
  public updateAwardName(awardName: string): void {
    if (awardName.length > 45) {
      throw new ValidationError('Award name cannot exceed 45 characters');
    }
    this.props.awardName = awardName;
  }

  public updateYearAwarded(year: number): void {
    if (year < 1950 || year > 2030) {
      throw new ValidationError('Year awarded must be between 1950 and 2030');
    }
    this.props.yearAwarded = year;
  }

  public getDisplayName(): string {
    if (!this.props.awardName) {
      return 'Unknown Award';
    }
    
    if (this.props.yearAwarded) {
      return `${this.props.awardName} (${this.props.yearAwarded})`;
    }
    
    return this.props.awardName;
  }

  public isRecentAward(): boolean {
    if (!this.props.yearAwarded) return false;
    const currentYear = new Date().getFullYear();
    return this.props.yearAwarded >= currentYear - 5;
  }

  public toPersistence(): {
    id?: number;
    playerId: number;
    awardName?: string;
    yearAwarded?: number;
  } {
    return {
      id: this.props.id,
      playerId: this.props.playerId,
      awardName: this.props.awardName,
      yearAwarded: this.props.yearAwarded,
    };
  }

  public equals(other: PlayerAward): boolean {
    return this.props.id === other.props.id;
  }
}

/*
## Usage Examples

### Create Player Award
```bash
curl -X POST http://localhost:3000/api/v1/player-awards \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": 1,
    "awardName": "MVP",
    "yearAwarded": 2023
  }'
```

### Get All Player Awards with Filters
```bash
curl "http://localhost:3000/api/v1/player-awards?playerId=1&yearFrom=2020&yearTo=2023&page=1&limit=10"
```

### Get Player Awards by Player ID
```bash
curl http://localhost:3000/api/v1/player-awards/player/1
```

### Get Player Awards by Award Name
```bash
curl http://localhost:3000/api/v1/player-awards/award/MVP
```

### Update Player Award
```bash
curl -X PUT http://localhost:3000/api/v1/player-awards/1 \
  -H "Content-Type: application/json" \
  -d '{
    "awardName": "Defensive Player of the Year",
    "yearAwarded": 2024
  }'
```

### Delete Player Award
```bash
curl -X DELETE http://localhost:3000/api/v1/player-awards/1
```

## Key Features Implemented

✅ **Domain Entity** with business logic and validation  
✅ **Repository Pattern** with interface and Prisma implementation  
✅ **DTO Validation** using Zod schemas  
✅ **Service Layer** with comprehensive business logic  
✅ **RESTful Controller** with proper error handling  
✅ **Flexible Routes** including specialized endpoints  
✅ **Duplicate Award Prevention** business rule  
✅ **Award Display Formatting** for better UX  
✅ **Recent Award Detection** for analytics  
✅ **Comprehensive Filtering** by player, award, and year ranges  
✅ **Pagination Support** for large datasets  
✅ **Count Aggregation** for player statistics  

The PlayerAward module is complete and ready for integration with your existing codebase!
*/