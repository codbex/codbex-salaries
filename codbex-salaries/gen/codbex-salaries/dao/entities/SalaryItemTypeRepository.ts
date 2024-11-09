import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface SalaryItemTypeEntity {
    readonly Id: number;
    Name?: string;
}

export interface SalaryItemTypeCreateEntity {
    readonly Name?: string;
}

export interface SalaryItemTypeUpdateEntity extends SalaryItemTypeCreateEntity {
    readonly Id: number;
}

export interface SalaryItemTypeEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
    },
    $select?: (keyof SalaryItemTypeEntity)[],
    $sort?: string | (keyof SalaryItemTypeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface SalaryItemTypeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<SalaryItemTypeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface SalaryItemTypeUpdateEntityEvent extends SalaryItemTypeEntityEvent {
    readonly previousEntity: SalaryItemTypeEntity;
}

export class SalaryItemTypeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_SALARYITEMTYPE",
        properties: [
            {
                name: "Id",
                column: "SALARYITEMTYPE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "SALARYITEMTYPE_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(SalaryItemTypeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: SalaryItemTypeEntityOptions): SalaryItemTypeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): SalaryItemTypeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: SalaryItemTypeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_SALARYITEMTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "SALARYITEMTYPE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: SalaryItemTypeUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_SALARYITEMTYPE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "SALARYITEMTYPE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: SalaryItemTypeCreateEntity | SalaryItemTypeUpdateEntity): number {
        const id = (entity as SalaryItemTypeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as SalaryItemTypeUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "CODBEX_SALARYITEMTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "SALARYITEMTYPE_ID",
                value: id
            }
        });
    }

    public count(options?: SalaryItemTypeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALARYITEMTYPE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: SalaryItemTypeEntityEvent | SalaryItemTypeUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-salaries-entities-SalaryItemType", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-salaries-entities-SalaryItemType").send(JSON.stringify(data));
    }
}
