package gen.codbex_salaries.data.salaries;

import org.eclipse.dirigible.sdk.db.Column;
import org.eclipse.dirigible.sdk.db.CreatedAt;
import org.eclipse.dirigible.sdk.db.CreatedBy;
import org.eclipse.dirigible.sdk.platform.Documentation;
import org.eclipse.dirigible.sdk.db.Entity;
import org.eclipse.dirigible.sdk.db.GeneratedValue;
import org.eclipse.dirigible.sdk.db.GenerationType;
import org.eclipse.dirigible.sdk.db.Id;
import org.eclipse.dirigible.sdk.db.Table;
import org.eclipse.dirigible.sdk.db.UpdatedAt;
import org.eclipse.dirigible.sdk.db.UpdatedBy;

@Entity(name = "codbex_salaries_SalaryEntity")
@Table(name = "CODBEX_SALARY")
@Documentation("Salary entity mapping")
public class SalaryEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SALARY_ID")
    @Documentation("Id")
    public Integer Id;

    @Column(name = "SALARY_EMPLOYEE", nullable = true)
    @Documentation("Employee")
    public Integer Employee;

    @Column(name = "SALARY_CURRENCY", nullable = true)
    @Documentation("Currency")
    public Integer Currency;

    @Column(name = "SALARY_STATUS", nullable = true)
    @Documentation("Status")
    public Integer Status;

    @Column(name = "SALARY_ROLE", nullable = true)
    @Documentation("Role")
    public Integer Role;

    @Column(name = "SALARY_STARTDATE", nullable = true)
    @Documentation("StartDate")
    public java.time.LocalDate StartDate;

    @Column(name = "SALARY_ENDDATE", nullable = true)
    @Documentation("EndDate")
    public java.time.LocalDate EndDate;

    @Column(name = "SALARY_GROSS", nullable = true)
    @Documentation("Gross")
    public Double Gross;

    @Column(name = "SALARY_NET", nullable = true)
    @Documentation("Net")
    public Double Net;

}
