import { SalaryRepository as SalaryDao } from "codbex-salaries/gen/codbex-salaries/dao/Salaries/SalaryRepository";
import { CurrencyRepository as CurrencyDao } from "codbex-currencies/gen/codbex-currencies/dao/Currencies/CurrencyRepository";
import { Controller, Get } from "sdk/http";

@Controller
class SalariesService {

    private readonly salaryDao;
    private readonly currencyDao;

    constructor() {
        this.salaryDao = new SalaryDao();
        this.currencyDao = new CurrencyDao();
    }

    @Get("/SalariesSum")
    public SalariesSum() {

        const allActiveSalaries = this.salaryDao.findAll({
            $filter: {
                equals: {
                    Status: 1
                }
            }
        });

        let salariesSum = 0;

        allActiveSalaries.forEach((salary) => {
            salariesSum += salary.Net;
        });

        const currencies = this.currencyDao.findAll({
            $filter: {
                equals: {
                    Id: allActiveSalaries[0].Currency
                }
            }
        });

        return {
            salariesSum: salariesSum,
            currency: currencies[0].Code
        };
    }

}