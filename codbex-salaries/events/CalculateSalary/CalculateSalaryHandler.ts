import { SalaryRepository } from "../../gen/codbex-salaries/dao/Salaries/SalaryRepository";

export const trigger = (event) => {

    const SalaryDao = new SalaryRepository();

    const salaryItem = event.entity;

    const salary = SalaryDao.findAll({
        $filter: {
            equals: {
                Id: salaryItem.Salary
            }
        }
    });

    if (salaryItem.Direction === 1) {
        salary[0].Gross += salaryItem.Quantity;
    }

    salary[0].Net += salaryItem.Amount;

    SalaryDao.update(salary[0]);

}