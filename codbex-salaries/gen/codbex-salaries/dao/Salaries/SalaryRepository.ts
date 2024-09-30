import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface SalaryEntity {
    readonly Id: number;
    Employee?: number;
    Currency?: number;
    SalaryStatus?: number;
    JobRole?: number;
    StartDate?: Date;
    EndDate?: Date;
    Gross?: number;
    Net?: number;
}

export interface SalaryCreateEntity {
    readonly Employee?: number;
    readonly Currency?: number;
    readonly SalaryStatus?: number;
    readonly JobRole?: number;
    readonly StartDate?: Date;
    readonly EndDate?: Date;
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
            JobRole?: number | number[];
            StartDate?: Date | Date[];
            EndDate?: Date | Date[];
            Gross?: number | number[];
            Net?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Employee?: number | number[];
            Currency?: number | number[];
            SalaryStatus?: number | number[];
            JobRole?: number | number[];
            StartDate?: Date | Date[];
            EndDate?: Date | Date[];
            Gross?: number | number[];
            Net?: number | number[];
        };
        contains?: {
            Id?: number;
            Employee?: number;
            Currency?: number;
            SalaryStatus?: number;
            JobRole?: number;
            StartDate?: Date;
            EndDate?: Date;
            Gross?: number;
            Net?: number;
        };
        greaterThan?: {
            Id?: number;
            Employee?: number;
            Currency?: number;
            SalaryStatus?: number;
            JobRole?: number;
            StartDate?: Date;
            EndDate?: Date;
            Gross?: number;
            Net?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Employee?: number;
            Currency?: number;
            SalaryStatus?: number;
            JobRole?: number;
            StartDate?: Date;
            EndDate?: Date;
            Gross?: number;
            Net?: number;
        };
        lessThan?: {
            Id?: number;
            Employee?: number;
            Currency?: number;
            SalaryStatus?: number;
            JobRole?: number;
            StartDate?: Date;
            EndDate?: Date;
            Gross?: number;
            Net?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Employee?: number;
            Currency?: number;
            SalaryStatus?: number;
            JobRole?: number;
            StartDate?: Date;
            EndDate?: Date;
            Gross?: number;
            Net?: number;
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
                name: "JobRole",
                column: "SALARY_JOBROLE",
                type: "INTEGER",
            },
            {
                name: "StartDate",
                column: "SALARY_STARTDATE",
                type: "DATE",
            },
            {
                name: "EndDate",
                column: "SALARY_ENDDATE",
                type: "DATE",
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
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(SalaryRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: SalaryEntityOptions): SalaryEntity[] {
        return this.dao.list(options).map((e: SalaryEntity) => {
            EntityUtils.setDate(e, "StartDate");
            EntityUtils.setDate(e, "EndDate");
            return e;
        });
    }

    public findById(id: number): SalaryEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "StartDate");
        EntityUtils.setDate(entity, "EndDate");
        return entity ?? undefined;
    }

    public create(entity: SalaryCreateEntity): number {
        EntityUtils.setLocalDate(entity, "StartDate");
        EntityUtils.setLocalDate(entity, "EndDate");
        if (entity.Gross === undefined || entity.Gross === null) {
            (entity as SalaryEntity).Gross = 0;
        }
        if (entity.Net === undefined || entity.Net === null) {
            (entity as SalaryEntity).Net = 0;
        }
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
        // EntityUtils.setLocalDate(entity, "StartDate");
        // EntityUtils.setLocalDate(entity, "EndDate");
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
