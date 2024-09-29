import { GenerateSalariesService } from './GenerateSalariesService';
import { EmployeeAssignmentRepository } from "codbex-employees/gen/codbex-employees/dao/Employees/EmployeeAssignmentRepository";
import { EmployeeRepository } from "codbex-employees/gen/codbex-employees/dao/Employees/EmployeeRepository";
import { JobAssignmentRepository } from "codbex-jobs/gen/codbex-jobs/dao/JobAssignment/JobAssignmentRepository";
import { SalaryRepository } from "codbex-salaries/gen/codbex-salaries/dao/Salaries/SalaryRepository";


const EmployeeAssignmentDao = new EmployeeAssignmentRepository();
const JobAssignmentDao = new JobAssignmentRepository();
const EmployeeDao = new EmployeeRepository();
const SalaryDao = new SalaryRepository();

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

    const salaryCount = SalaryDao.count();

    const salary = {
        "id": salaryCount + 1,
        "employee": employee[0].Id,
        "currency": 30,
        "salaryStatus": 1,
        "jobPosition": jobAssignment[0].JobPosition
    }

    GenerateSalariesService.saveSalaries(salary);
});

