package gen.codbex_salaries.data.settings;

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

@Entity(name = "codbex_salaries_SalaryItemTypeEntity")
@Table(name = "CODBEX_SALARYITEMTYPE")
@Documentation("SalaryItemType entity mapping")
public class SalaryItemTypeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SALARYITEMTYPE_ID")
    @Documentation("Id")
    public Integer Id;

    @Column(name = "SALARYITEMTYPE_NAME", length = 200, nullable = true)
    @Documentation("Name")
    public String Name;

}
