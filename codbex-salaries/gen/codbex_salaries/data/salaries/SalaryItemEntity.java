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

@Entity(name = "codbex_salaries_SalaryItemEntity")
@Table(name = "CODBEX_SALARYITEM")
@Documentation("SalaryItem entity mapping")
public class SalaryItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SALARYITEM_ID")
    @Documentation("Id")
    public Integer Id;

    @Column(name = "SALARYITEM_SALARY", nullable = true)
    @Documentation("Salary")
    public Integer Salary;

    @Column(name = "SALARYITEM_TYPE", nullable = true)
    @Documentation("Type")
    public Integer Type;

    @Column(name = "SALARYITEM_QUANTITY", nullable = true)
    @Documentation("Quantity")
    public Double Quantity;

    @Column(name = "SALARYITEM_DIRECTION", nullable = true)
    @Documentation("Direction")
    public Integer Direction;

    @Column(name = "SALARYITEM_AMOUNT", nullable = true)
    @Documentation("Amount")
    public Double Amount;

}
