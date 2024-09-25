import { SalaryItemRepository } from "../../gen/codbex-salaries/dao/Salaries/SalaryItemRepository";
import { SalaryRepository } from "../../gen/codbex-salaries/dao/Salaries/SalaryRepository";

export const trigger = (event) => {

    const SalaryItemDao = new SalaryItemRepository();
    const SalaryDao = new SalaryRepository();

    const salaryItem = event.entity;

    const salary = SalaryDao.findAll({
        $filter: {
            equals: {
                Id: salaryItem.Salary
            }
        }
    });

    console.log(JSON.stringify(salary[0]));
    console.log(JSON.stringify(salaryItem));

    console.log(salary[0].Net);
    console.log(salary[0].Gross);

    salary[0].Gross += salaryItem.Quantity;
    salary[0].Net += salaryItem.Amount;

    console.log(JSON.stringify(salary[0]));

    SalaryDao.update(salary[0]);

}