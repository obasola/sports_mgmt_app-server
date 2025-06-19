// src/domain/player/entities/Player.ts

import { ValidationError } from '@/shared/errors/AppError';
import { PlayerLocation } from "@/domain/player/value-objects/PlayerLocation";
import { PlayerName } from "@/domain/player/value-objects/PlayerName";
import { PlayerPhysicals } from "../value-objects/PlayerPhysicals";


export interface PlayerProps {
  id?: number;
  firstName: string;
  lastName: string;
  age: number;
  height?: number;
  weight?: number;
  handSize?: number;
  armLength?: number;
  homeCity?: string;
  homeState?: string;
  university?: string;
  status?: string;
  position?: string;
  yearEnteredLeague?: number;
  prospectId?: number;

}

export class Player {
  private constructor(private props: PlayerProps) {
    this.validate();
  }

  public static create(props: PlayerProps): Player {
    return new Player(props);
  }

  public static fromPersistence(data: {
    id: number;
    firstName: string;
    lastName: string;
    age: number;
    height?: number | null;
    weight?: number | null;
    handSize?: number | null;
    armLength?: number | null;
    homeCity?: string | null;
    homeState?: string | null;
    university?: string | null;
    status?: string | null;
    position?: string | null;
    yearEnteredLeague?: number | null;
    prospectId?: number | null;

  }): Player {
    return new Player({
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      age: data.age,
      height: data.height || undefined,
      weight: data.weight || undefined,
      handSize: data.handSize || undefined,
      armLength: data.armLength || undefined,
      homeCity: data.homeCity || undefined,
      homeState: data.homeState || undefined,
      university: data.university || undefined,
      status: data.status || undefined,
      position: data.position || undefined,
      yearEnteredLeague: data.yearEnteredLeague || undefined,
      prospectId: data.prospectId || undefined,

    });
  }

  private validate(): void {
    // Validate name
    const name = new PlayerName(this.props.firstName, this.props.lastName);
    
    // Validate age
    if (this.props.age < 18 || this.props.age > 50) {
      throw new ValidationError('Player age must be between 18 and 50');
    }

    // Validate year entered league if provided
    if (this.props.yearEnteredLeague) {
      const currentYear = new Date().getFullYear();
      if (this.props.yearEnteredLeague < 1950 || this.props.yearEnteredLeague > currentYear + 1) {
        throw new ValidationError('Year entered league must be between 1950 and current year + 1');        
      }
    }

    // Validate physicals if provided
    if (this.props.height || this.props.weight || this.props.handSize || this.props.armLength) {
      new PlayerPhysicals(this.props.height, this.props.weight, this.props.handSize, this.props.armLength);
    }

    // Validate location if provided
    if (this.props.homeCity || this.props.homeState) {
      new PlayerLocation(this.props.homeCity, this.props.homeState);
    }
  }

  // Getters
  public get id(): number | undefined {
    return this.props.id;
  }

  public get firstName(): string {
    return this.props.firstName;
  }

  public get lastName(): string {
    return this.props.lastName;
  }

  public get fullName(): string {
    const name = new PlayerName(this.props.firstName, this.props.lastName);
    return name.getFullName();
  }

  public get age(): number {
    return this.props.age;
  }

  public get height(): number | undefined {
    return this.props.height;
  }

  public get weight(): number | undefined {
    return this.props.weight;
  }

  public get handSize(): number | undefined {
    return this.props.handSize;
  }

  public get armLength(): number | undefined {
    return this.props.armLength;
  }

  public get homeCity(): string | undefined {
    return this.props.homeCity;
  }

  public get homeState(): string | undefined {
    return this.props.homeState;
  }

  public get university(): string | undefined {
    return this.props.university;
  }

  public get status(): string | undefined {
    return this.props.status;
  }

  public get position(): string | undefined {
    return this.props.position;
  }

  public get yearEnteredLeague(): number | undefined {
    return this.props.yearEnteredLeague;
  }

  public get prospectId(): number | undefined {
    return this.props.prospectId;
  }

  // Business method
  public updatePersonalInfo(firstName: string, lastName: string, age: number): void {
    // Validate new name
    new PlayerName(firstName, lastName);
    
    // Validate new age
    if (age < 18 || age > 50) {
      throw new ValidationError('Player age must be between 18 and 50');
    }

    this.props.firstName = firstName;
    this.props.lastName = lastName;
    this.props.age = age;

  }

  public updatePhysicals(height?: number, weight?: number, handSize?: number, armLength?: number): void {
    // Validate physicals if any provided
    if (height || weight || handSize || armLength) {
      new PlayerPhysicals(height, weight, handSize, armLength);
    }

    this.props.height = height;
    this.props.weight = weight;
    this.props.handSize = handSize;
    this.props.armLength = armLength;
    
  }

  public updateLocation(homeCity?: string, homeState?: string): void {
    // Validate location if provided
    if (homeCity || homeState) {
      new PlayerLocation(homeCity, homeState);
    }

    this.props.homeCity = homeCity;
    this.props.homeState = homeState;

  }

  public updateCareerInfo(university?: string, status?: string, position?: string, yearEnteredLeague?: number): void {
    // Validate year entered league if provided
    if (yearEnteredLeague) {
      const currentYear = new Date().getFullYear();
      if (yearEnteredLeague < 1950 || yearEnteredLeague > currentYear + 1) {
        throw new ValidationError('Year entered league must be between 1950 and current year + 1');
      }
    }

    this.props.university = university;
    this.props.status = status;
    this.props.position = position;
    this.props.yearEnteredLeague = yearEnteredLeague;

  }

  public linkToProspect(prospectId: number): void {
    if (prospectId <= 0) {
      throw new ValidationError('Prospect ID must be positive');
    }
    
    this.props.prospectId = prospectId;

  }

  public unlinkFromProspect(): void {
    this.props.prospectId = undefined;

  }

  public calculateYearsInLeague(): number | null {
    if (!this.props.yearEnteredLeague) {
      return null;
    }
    
    const currentYear = new Date().getFullYear();
    return Math.max(0, currentYear - this.props.yearEnteredLeague);
  }

  public isRookie(): boolean {
    const yearsInLeague = this.calculateYearsInLeague();
    return yearsInLeague === 0;
  }

  public isVeteran(): boolean {
    const yearsInLeague = this.calculateYearsInLeague();
    return yearsInLeague !== null && yearsInLeague >= 5;
  }

  public toPersistence(): {
    id?: number;
    firstName: string;
    lastName: string;
    age: number;
    height?: number;
    weight?: number;
    handSize?: number;
    armLength?: number;
    homeCity?: string;
    homeState?: string;
    university?: string;
    status?: string;
    position?: string;
    yearEnteredLeague?: number;
    prospectId?: number;
  } {
    return {
      id: this.props.id,
      firstName: this.props.firstName,
      lastName: this.props.lastName,
      age: this.props.age,
      height: this.props.height,
      weight: this.props.weight,
      handSize: this.props.handSize,
      armLength: this.props.armLength,
      homeCity: this.props.homeCity,
      homeState: this.props.homeState,
      university: this.props.university,
      status: this.props.status,
      position: this.props.position,
      yearEnteredLeague: this.props.yearEnteredLeague,
      prospectId: this.props.prospectId,
    };
  }

  public equals(other: Player): boolean {
    return this.props.id === other.props.id;
  }
}