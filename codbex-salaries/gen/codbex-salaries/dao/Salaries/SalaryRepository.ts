import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface SalaryEntity {
    readonly Id: number;
    Employee?: number;
    Currency?: number;
    SalaryStatus?: number;
    JobPosition?: number;
    Gross?: number;
    Net?: number;
    Total?: number;
}

export interface SalaryCreateEntity {
    readonly Employee?: number;
    readonly Currency?: number;
    readonly SalaryStatus?: number;
    readonly JobPosition?: number;
    readonly Gross?: number;
    readonly Net?: number;
    readonly Total?: number;
}

export interface SalaryUpdateEntity extends SalaryCreateEntity {
    readonly Id: number;
}

export interface SalaryEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Employee?: number | number[];
            Currency?: number | number[];
            SalaryStatus?: number | number[];
            JobPosition?: number | number[];
            Gross?: number | number[];
            Net?: number | number[];
            Total?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Employee?: number | number[];
            Currency?: number | number[];
            SalaryStatus?: number | number[];
            JobPosition?: number | number[];
            Gross?: number | number[];
            Net?: number | number[];
            Total?: number | number[];
        };
        contains?: {
            Id?: number;
            Employee?: number;
            Currency?: number;
            SalaryStatus?: number;
            JobPosition?: number;
            Gross?: number;
            Net?: number;
            Total?: number;
        };
        greaterThan?: {
            Id?: number;
            Employee?: number;
            Currency?: number;
            SalaryStatus?: number;
            JobPosition?: number;
            Gross?: number;
            Net?: number;
            Total?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Employee?: number;
            Currency?: number;
            SalaryStatus?: number;
            JobPosition?: number;
            Gross?: number;
            Net?: number;
            Total?: number;
        };
        lessThan?: {
            Id?: number;
            Employee?: number;
            Currency?: number;
            SalaryStatus?: number;
            JobPosition?: number;
            Gross?: number;
            Net?: number;
            Total?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Employee?: number;
            Currency?: number;
            SalaryStatus?: number;
            JobPosition?: number;
            Gross?: number;
            Net?: number;
            Total?: number;
        };
    },
    $select?: (keyof SalaryEntity)[],
    $sort?: string | (keyof SalaryEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface SalaryEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<SalaryEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface SalaryUpdateEntityEvent extends SalaryEntityEvent {
    readonly previousEntity: SalaryEntity;
}

export class SalaryRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_SALARY",
        properties: [
            {
                name: "Id",
                column: "SALARY_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Employee",
                column: "SALARY_EMPLOYEE",
                type: "INTEGER",
            },
            {
                name: "Currency",
                column: "SALARY_CURRENCY",
                type: "INTEGER",
            },
            {
                name: "SalaryStatus",
                column: "SALARY_SALARYSTATUS",
                type: "INTEGER",
            },
            {
                name: "JobPosition",
                column: "SALARY_JOBPOSITION",
                type: "INTEGER",
            },
            {
                name: "Gross",
                column: "SALARY_GROSS",
                type: "DOUBLE",
            },
            {
                name: "Net",
                column: "SALARY_NET",
                type: "DOUBLE",
            },
            {
                name: "Total",
                column: "SALARY_TOTAL",
                type: "DOUBLE",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(SalaryRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: SalaryEntityOptions): SalaryEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): SalaryEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: SalaryCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_SALARY",
            entity: entity,
            key: {
                name: "Id",
                column: "SALARY_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: SalaryUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_SALARY",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "SALARY_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: SalaryCreateEntity | SalaryUpdateEntity): number {
        const id = (entity as SalaryUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as SalaryUpdateEntity);
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
            table: "CODBEX_SALARY",
            entity: entity,
            key: {
                name: "Id",
                column: "SALARY_ID",
                value: id
            }
        });
    }

    public count(options?: SalaryEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_SALARY"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: SalaryEntityEvent | SalaryUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-salaries-Salaries-Salary", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-salaries-Salaries-Salary").send(JSON.stringify(data));
    }
}
