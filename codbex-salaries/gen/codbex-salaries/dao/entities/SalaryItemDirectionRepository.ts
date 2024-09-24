import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface SalaryItemDirectionEntity {
    readonly Direction: number;
}

export interface SalaryItemDirectionCreateEntity {
}

export interface SalaryItemDirectionUpdateEntity extends SalaryItemDirectionCreateEntity {
    readonly Direction: number;
}

export interface SalaryItemDirectionEntityOptions {
    $filter?: {
        equals?: {
            Direction?: number | number[];
        };
        notEquals?: {
            Direction?: number | number[];
        };
        contains?: {
            Direction?: number;
        };
        greaterThan?: {
            Direction?: number;
        };
        greaterThanOrEqual?: {
            Direction?: number;
        };
        lessThan?: {
            Direction?: number;
        };
        lessThanOrEqual?: {
            Direction?: number;
        };
    },
    $select?: (keyof SalaryItemDirectionEntity)[],
    $sort?: string | (keyof SalaryItemDirectionEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface SalaryItemDirectionEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<SalaryItemDirectionEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface SalaryItemDirectionUpdateEntityEvent extends SalaryItemDirectionEntityEvent {
    readonly previousEntity: SalaryItemDirectionEntity;
}

export class SalaryItemDirectionRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_SALARYITEMDIRECTION",
        properties: [
            {
                name: "Direction",
                column: "SALARYITEMDIRECTION_DIRECTION",
                type: "INTEGER",
                id: true,
                autoIncrement: false,
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(SalaryItemDirectionRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: SalaryItemDirectionEntityOptions): SalaryItemDirectionEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): SalaryItemDirectionEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: SalaryItemDirectionCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_SALARYITEMDIRECTION",
            entity: entity,
            key: {
                name: "Direction",
                column: "SALARYITEMDIRECTION_DIRECTION",
                value: id
            }
        });
        return id;
    }

    public update(entity: SalaryItemDirectionUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_SALARYITEMDIRECTION",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Direction",
                column: "SALARYITEMDIRECTION_DIRECTION",
                value: entity.Direction
            }
        });
    }

    public upsert(entity: SalaryItemDirectionCreateEntity | SalaryItemDirectionUpdateEntity): number {
        const id = (entity as SalaryItemDirectionUpdateEntity).Direction;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as SalaryItemDirectionUpdateEntity);
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
            table: "CODBEX_SALARYITEMDIRECTION",
            entity: entity,
            key: {
                name: "Direction",
                column: "SALARYITEMDIRECTION_DIRECTION",
                value: id
            }
        });
    }

    public count(options?: SalaryItemDirectionEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALARYITEMDIRECTION"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: SalaryItemDirectionEntityEvent | SalaryItemDirectionUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-salaries-entities-SalaryItemDirection", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-salaries-entities-SalaryItemDirection").send(JSON.stringify(data));
    }
}
