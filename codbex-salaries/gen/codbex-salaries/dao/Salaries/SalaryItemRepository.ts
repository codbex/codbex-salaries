import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface SalaryItemEntity {
    readonly Id: number;
    Salary?: number;
    Type?: number;
    Quantity?: number;
    Direction?: number;
    Amount?: number;
}

export interface SalaryItemCreateEntity {
    readonly Salary?: number;
    readonly Type?: number;
    readonly Quantity?: number;
    readonly Direction?: number;
}

export interface SalaryItemUpdateEntity extends SalaryItemCreateEntity {
    readonly Id: number;
}

export interface SalaryItemEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Salary?: number | number[];
            Type?: number | number[];
            Quantity?: number | number[];
            Direction?: number | number[];
            Amount?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Salary?: number | number[];
            Type?: number | number[];
            Quantity?: number | number[];
            Direction?: number | number[];
            Amount?: number | number[];
        };
        contains?: {
            Id?: number;
            Salary?: number;
            Type?: number;
            Quantity?: number;
            Direction?: number;
            Amount?: number;
        };
        greaterThan?: {
            Id?: number;
            Salary?: number;
            Type?: number;
            Quantity?: number;
            Direction?: number;
            Amount?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Salary?: number;
            Type?: number;
            Quantity?: number;
            Direction?: number;
            Amount?: number;
        };
        lessThan?: {
            Id?: number;
            Salary?: number;
            Type?: number;
            Quantity?: number;
            Direction?: number;
            Amount?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Salary?: number;
            Type?: number;
            Quantity?: number;
            Direction?: number;
            Amount?: number;
        };
    },
    $select?: (keyof SalaryItemEntity)[],
    $sort?: string | (keyof SalaryItemEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface SalaryItemEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<SalaryItemEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface SalaryItemUpdateEntityEvent extends SalaryItemEntityEvent {
    readonly previousEntity: SalaryItemEntity;
}

export class SalaryItemRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_SALARYITEM",
        properties: [
            {
                name: "Id",
                column: "SALARYITEM_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Salary",
                column: "SALARYITEM_SALARY",
                type: "INTEGER",
            },
            {
                name: "Type",
                column: "SALARYITEM_TYPE",
                type: "INTEGER",
            },
            {
                name: "Quantity",
                column: "SALARYITEM_QUANTITY",
                type: "DOUBLE",
            },
            {
                name: "Direction",
                column: "SALARYITEM_DIRECTION",
                type: "INTEGER",
            },
            {
                name: "Amount",
                column: "SALARYITEM_AMOUNT",
                type: "DOUBLE",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(SalaryItemRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: SalaryItemEntityOptions): SalaryItemEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): SalaryItemEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: SalaryItemCreateEntity): number {
        // @ts-ignore
        (entity as SalaryItemEntity).Amount = entity["Quantity"]*entity["Direction"];
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_SALARYITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "SALARYITEM_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: SalaryItemUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_SALARYITEM",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "SALARYITEM_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: SalaryItemCreateEntity | SalaryItemUpdateEntity): number {
        const id = (entity as SalaryItemUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as SalaryItemUpdateEntity);
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
            table: "CODBEX_SALARYITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "SALARYITEM_ID",
                value: id
            }
        });
    }

    public count(options?: SalaryItemEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALARYITEM"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: SalaryItemEntityEvent | SalaryItemUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-salaries-Salaries-SalaryItem", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-salaries-Salaries-SalaryItem").send(JSON.stringify(data));
    }
}
