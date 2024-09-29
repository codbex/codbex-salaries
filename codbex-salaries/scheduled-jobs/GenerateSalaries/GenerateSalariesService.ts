import { insert } from "sdk/db";

export interface Salary {
    Id: number,
    Employee: number,
    Currency: number,
    SalaryStatus: number,
    JobPosition: number
}
export class Logger {

    public static saveSalaries(salariesData: Salary) {
        const sql = `insert into CODBEX_SALARY ("SALARY_ID","SALARY_EMPLOYEE", "SALARY_CURRENCY", "SALARY_SALARYSTATUS","SALARY_JOBPOSITION") values (?, ?, ?, ?, ?)`;
        const queryParameters = [salariesData.Employee, salariesData.Currency, salariesData.SalaryStatus, salariesData.JobPosition];
        insert.execute(sql, queryParameters);
    }

}