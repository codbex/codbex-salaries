import { insert } from "sdk/db";

export interface Salary {
    readonly id: number,
    readonly employee: number,
    readonly currency: number,
    readonly salaryStatus: number,
    readonly jobPosition: number
}
export class GenerateSalariesService {

    public static saveSalaries(salariesData: Salary) {
        const sql = `INSERT INTO "CODBEX_SALARY" ("SALARY_ID","SALARY_EMPLOYEE", "SALARY_CURRENCY", "SALARY_SALARYSTATUS","SALARY_JOBPOSITION") values (?, ?, ?, ?, ?)`;
        const queryParameters = [salariesData.id, salariesData.employee, salariesData.currency, salariesData.salaryStatus, salariesData.jobPosition];
        insert.execute(sql, queryParameters);
    }

}