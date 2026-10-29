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

@Entity(name = "codbex_salaries_SalaryStatusEntity")
@Table(name = "CODBEX_SALARYSTATUS")
@Documentation("SalaryStatus entity mapping")
public class SalaryStatusEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "SALARYSTATUS_ID")
    @Documentation("Id")
    public Integer Id;

    @Column(name = "SALARYSTATUS_NAME", length = 20, nullable = true)
    @Documentation("Name")
    public String Name;

}
