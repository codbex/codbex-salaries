import { Logger } from './Logger';
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

    console.log("ee" + salaryCount);

    const salary = {
        "Id": salaryCount + 1,
        "Employee": employee[0].Id,
        "Currency": 30,
        "SalaryStatus": 1,
        "JobPosition": jobAssignment[0].JobPosition
    }

    // console.log(JSON.stringify(salary));

    Logger.saveSalaries(salary);
});

