// src/domain/person/mapper/PersonMapper.ts
import { PersonProps } from "../dtos/PersonDTO";
import { NewPersonInput, Person } from "../entities/Person";

export class PersonMapper {
  /**
   * Maps individual parameters to NewPersonInput
   */
  static mapToNewPersonInput(
    userName: string,
    emailAddress: string,
    passwordHash: string,
    firstName: string,
    lastName: string,
    activeRid?: number | null
  ): NewPersonInput {
    return {
      userName,
      emailAddress,
      passwordHash,
      firstName,
      lastName,
      activeRid,
    };
  }
  static mapPersonToNewPersonInput(
    person: Person
  ): NewPersonInput {
    return {
      userName: person.userName,
      emailAddress: person.emailAddress,
      passwordHash: person.passwordHash ? person.passwordHash : '',
      firstName: person.firstName,
      lastName: person.lastName,
      activeRid: person.activeRid,
    };
  }
  /**
   * Maps NewPersonInput to PersonProps for entity creation
   */
  static mapNewPersonInputToProps(input: NewPersonInput): PersonProps {
    return {
      userName: input.userName,
      emailAddress: input.emailAddress,
      passwordHash: input.passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      activeRid: input.activeRid ?? null,
      isActive: true,
      emailVerified: false,
      verifiedAt: null,
      createdAt: null,
      updatedAt: null,
      lastLoginAt: null,
    };
  }

  /**
   * Maps individual parameters to PersonProps (e.g., from database row)
   */
  static mapToProps(
    pid: number | undefined,
    userName: string,
    emailAddress: string,
    passwordHash: string | null,
    firstName: string,
    lastName: string,
    activeRid: number | null,
    isActive: boolean,
    emailVerified: boolean,
    verifiedAt: Date | null,
    createdAt: Date | null,
    updatedAt: Date | null,
    lastLoginAt: Date | null
  ): PersonProps {
    return {
      pid,
      userName,
      emailAddress,
      passwordHash,
      firstName,
      lastName,
      activeRid,
      isActive,
      emailVerified,
      verifiedAt,
      createdAt,
      updatedAt,
      lastLoginAt,
    };
  }

  /**
   * Maps a database result object to PersonProps
   */
  static mapFromDatabaseRow(row: any): PersonProps {
    return {
      pid: row.pid,
      userName: row.userName,
      emailAddress: row.emailAddress,
      passwordHash: row.passwordHash,
      firstName: row.firstName,
      lastName: row.lastName,
      activeRid: row.activeRid,
      isActive: row.isActive,
      emailVerified: row.emailVerified,
      verifiedAt: row.verifiedAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lastLoginAt: row.lastLoginAt,
    };
  }

}
