import { insert } from "sdk/db";

export interface Salary {
    readonly id: number,
    readonly employee: number,
    readonly currency: number,
    readonly salaryStatus: number,
    readonly jobPosition: number,
    readonly gross: number,
    readonly net: number
}

export interface SalaryItem {
    readonly id: number,
    readonly salary: number,
    readonly name: string,
    readonly quantity: number,
    readonly direction: number,
    readonly amount: number
}

export class GenerateSalariesService {

    public static saveSalaries(salariesData: Salary) {
        const sql = `INSERT INTO "CODBEX_SALARY" ("SALARY_ID","SALARY_EMPLOYEE", "SALARY_CURRENCY", "SALARY_SALARYSTATUS","SALARY_JOBPOSITION","SALARY_GROSS","SALARY_NET") values (?, ?, ?, ?, ?, ?, ?)`;
        const queryParameters = [salariesData.id, salariesData.employee, salariesData.currency, salariesData.salaryStatus, salariesData.jobPosition, salariesData.gross, salariesData.net];

        insert.execute(sql, queryParameters);
    }

    public static saveSalaryItems(salaryItemsData: SalaryItem[]) {
        const sql = `INSERT INTO "CODBEX_SALARYITEM" ("SALARYITEM_ID","SALARYITEM_SALARY", "SALARYITEM_NAME", "SALARYITEM_QUANTITY","SALARYITEM_DIRECTION","SALARYITEM_AMOUNT") values (?, ?, ?, ?, ?,?)`;

        const queryParametersSalary = [salaryItemsData[0].id, salaryItemsData[0].salary, salaryItemsData[0].name, salaryItemsData[0].quantity, salaryItemsData[0].direction, salaryItemsData[0].amount];
        const queryParametersTaxes = [salaryItemsData[1].id, salaryItemsData[1].salary, salaryItemsData[1].name, salaryItemsData[1].quantity, salaryItemsData[1].direction, salaryItemsData[1].amount];

        insert.execute(sql, queryParametersSalary);
        insert.execute(sql, queryParametersTaxes);
    }
}