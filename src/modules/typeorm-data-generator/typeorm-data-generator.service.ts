import { Injectable } from '@nestjs/common';
import {
  DataSource,
  EntityTarget,
  FindOptionsRelations,
  FindOptionsRelationsProperty,
  FindOptionsSelect,
  FindOptionsSelectProperty,
} from 'typeorm';

@Injectable()
export class TypeormDataGeneratorService {
  constructor(private readonly dataSource: DataSource) {}

  async generateEntityData<E extends object>(
    entity: EntityTarget<E>,
    relations: FindOptionsRelations<E> = {},
    select: FindOptionsSelect<E> = {},
  ) {
    const metadata = this.dataSource.manager.connection.getMetadata(entity);
    const mock: Record<string, unknown> = {};
    const shouldOnlySelectProvidedProperties = Object.keys(select).length !== 0;

    for (const columnMetadata of metadata.ownColumns) {
      if (
        shouldOnlySelectProvidedProperties &&
        !select.hasOwnProperty(columnMetadata.propertyName)
      ) {
        continue;
      }

      if (!columnMetadata.relationMetadata) {
        if (columnMetadata.type === String) {
          mock[columnMetadata.propertyName] = this.getRandomString(
            columnMetadata.length !== '' ? +columnMetadata.length : 10,
          );
        } else if (columnMetadata.type === Boolean) {
          mock[columnMetadata.propertyName] = this.getRandomBoolean();
        } else if (columnMetadata.type === 'uuid') {
          mock[columnMetadata.propertyName] = crypto.randomUUID();
        } else if (columnMetadata.type === 'enum') {
          mock[columnMetadata.propertyName] = this.getRandomValueFromArray(
            columnMetadata.enum ?? [],
          );
        }
      }
    }

    for (const relationMetadata of metadata.ownRelations) {
      if (
        relations.hasOwnProperty(relationMetadata.propertyName) &&
        relations[relationMetadata.propertyName as keyof E]
      ) {
        const nestedRelationFindOptions =
          typeof relations[relationMetadata.propertyName as keyof E] ===
          'object'
            ? (relations[
                relationMetadata.propertyName as keyof E
              ] as FindOptionsRelationsProperty<typeof relationMetadata.type>)
            : {};

        const nestedSelectOptions =
          shouldOnlySelectProvidedProperties &&
          typeof select[relationMetadata.propertyName as keyof E] === 'object'
            ? (select[
                relationMetadata.propertyName as keyof E
              ] as FindOptionsSelectProperty<typeof relationMetadata.type>)
            : {};

        if (relationMetadata.isManyToOne) {
          mock[relationMetadata.propertyName] = await this.generateEntityData(
            relationMetadata.type,
            nestedRelationFindOptions,
            nestedSelectOptions,
          );
        } else if (relationMetadata.isOneToMany) {
          mock[relationMetadata.propertyName] =
            await this.generateMultipleEntityData(
              relationMetadata.type,
              this.getRandomInt(1, 3), // currently hardcoded
              nestedRelationFindOptions,
            );
        }
      }
    }

    return mock;
  }

  async generateMultipleEntityData<E extends object>(
    entity: EntityTarget<E>,
    count: number,
    relations: FindOptionsRelations<E> = {},
  ) {
    const result = [];
    for (let i = 0; i < count; i++) {
      const singleEntityData = await this.generateEntityData(entity, relations);
      result.push(singleEntityData);
    }

    return result;
  }

  private getRandomValueFromArray(arr: unknown[]) {
    return arr[this.getRandomInt(0, arr.length)];
  }

  private getRandomBoolean() {
    return Math.random() < 0.5;
  }

  private getRandomString(length: number = 10) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    const result = [];
    for (let i = 0; i < length; i++) {
      result.push(characters[this.getRandomInt(0, characters.length)]);
    }

    return result.join('');
  }

  private getRandomInt(min: number, max: number) {
    return Math.floor(this.getRandomNumber(min, max));
  }

  private getRandomNumber(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
}
