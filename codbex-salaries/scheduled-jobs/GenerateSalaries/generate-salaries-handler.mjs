import { GenerateSalariesService } from './GenerateSalariesService';
import { EmployeeAssignmentRepository } from "codbex-employees/gen/codbex-employees/dao/Employees/EmployeeAssignmentRepository";
import { EmployeeRepository } from "codbex-employees/gen/codbex-employees/dao/Employees/EmployeeRepository";
import { JobAssignmentRepository } from "codbex-jobs/gen/codbex-jobs/dao/JobAssignment/JobAssignmentRepository";
import { SalaryRepository } from "codbex-salaries/gen/codbex-salaries/dao/Salaries/SalaryRepository";
import { SalaryItemRepository } from "codbex-salaries/gen/codbex-salaries/dao/Salaries/SalaryItemRepository";
import { EmployeeContractRepository } from "codbex-contracts/gen/codbex-contracts/dao/EmployeeContracts/EmployeeContractRepository";

const EmployeeAssignmentDao = new EmployeeAssignmentRepository();
const JobAssignmentDao = new JobAssignmentRepository();
const EmployeeDao = new EmployeeRepository();
const SalaryDao = new SalaryRepository();
const SalaryItemDao = new SalaryItemRepository();
const EmployeeContractDao = new EmployeeContractRepository();

const employeeAssignments = EmployeeAssignmentDao.findAll();

employeeAssignments.forEach((assignment) => {

    const jobAssignment = JobAssignmentDao.findAll({
        $filter: {
            equals: {
                Id: assignment.JobAssignment
            }
        }
    });

    const employee = EmployeeDao.findAll({
        $filter: {
            equals: {
                Id: assignment.Employee
            }
        }
    });

    const employeeContract = EmployeeContractDao.findAll({
        $filter: {
            equals: {
                Id: jobAssignment[0].EmployeeContract
            }
        }
    });

    const salaryCount = SalaryDao.count();
    const salaryItemsCount = SalaryItemDao.count();

    const salaryGross = employeeContract[0].BaseSalary;
    const taxes = 0.22 * salaryGross;

    const salary = {
        "id": salaryCount + 1,
        "employee": employee[0].Id,
        "currency": 30,
        "salaryStatus": 1,
        "jobPosition": jobAssignment[0].JobPosition,
        "gross": salaryGross,
        "net": salaryGross - taxes
    };

    const salaryItemBaseSalary = {
        "id": salaryItemsCount + 1,
        "salary": salaryCount + 1,
        "name": "Base salary",
        "quantity": salaryGross,
        "direction": 1,
        "amount": salaryGross
    };

    const salaryItemTaxes = {
        "id": salaryItemsCount + 2,
        "salary": salaryCount + 1,
        "name": "Taxes",
        "quantity": taxes,
        "direction": -1,
        "amount": -1 * taxes
    };

    GenerateSalariesService.saveSalaries(salary);
    GenerateSalariesService.saveSalaryItems([salaryItemBaseSalary, salaryItemTaxes]);
});