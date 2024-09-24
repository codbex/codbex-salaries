import { SalaryItemRepository } from "../../gen/codbex-salaries/dao/Salaries/SalaryItemRepository";

export const trigger = (event) => {

    const SalaryItemDao = new SalaryItemRepository();

    const operation = event.operation;
    const salary = event.entity;

    if (operation === "create") {

        const salaryItems = SalaryItemDao.findAll({
            $filter: {
                equals: {
                    Salary: salary.Id
                }
            }
        });

        console.log(salaryItems);

    }

}