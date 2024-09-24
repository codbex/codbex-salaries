import { SalaryItemRepository } from "../../gen/codbex-salaries/dao/Salaries/SalaryItemRepository";
import { SalaryRepository } from "../../gen/codbex-salaries/dao/Salaries/SalaryRepository";

export const trigger = (event) => {

    const SalaryItemDao = new SalaryItemRepository();
    const SalaryDao = new SalaryRepository();

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

        console.log(JSON.stringify(salaryItems));

        let gross = 0;
        let net = 0;

        salaryItems.forEach(function (value) {
            gross += value.Quantity;
            net += value.Amount;
        });

        console.log(net);
        console.log(gross);

        salary.Net = net;
        salary.Gross = gross;

        console.log(salary);

        SalaryDao.create(salary);
    }

}