package events.CalculateSalary;

import java.util.Map;

import gen.codbex_salaries.data.salaries.SalaryEntity;
import gen.codbex_salaries.data.salaries.SalaryItemEntity;
import gen.codbex_salaries.data.salaries.SalaryRepository;

import org.eclipse.dirigible.sdk.component.Component;
import org.eclipse.dirigible.sdk.log.Logger;
import org.eclipse.dirigible.sdk.log.Logging;
import org.eclipse.dirigible.sdk.messaging.ListenerKind;
import org.eclipse.dirigible.sdk.messaging.MessageHandler;
import org.eclipse.dirigible.sdk.utils.Json;

/**
 * Adds a new salary item to its salary: its amount to the salary's net, and - for an incoming item -
 * its quantity to the gross.
 *
 * <p>
 * Listens on the salary item's create topic. The TypeScript handler it replaces was called on every
 * create, update and delete of an item and added it each time; adding on create only is what the
 * running totals mean.
 */
@Component
public class CalculateSalaryHandler implements MessageHandler {

    private static final Logger LOG = Logging.getLogger("events.CalculateSalary.CalculateSalaryHandler");

    /** The direction of an incoming salary item. */
    private static final int INCOMING = 1;

    private final SalaryRepository salaries;

    public CalculateSalaryHandler(SalaryRepository salaries) {
        this.salaries = salaries;
    }

    @Override
    public String destination() {
        return "codbex-salaries-Salaries-SalaryItem";
    }

    @Override
    public ListenerKind kind() {
        return ListenerKind.TOPIC;
    }

    @Override
    public void onMessage(String message) {
        SalaryItemEntity item = Json.parse(message, SalaryItemEntity.class);
        if (item == null || item.Salary == null) {
            return;
        }
        SalaryEntity salary = salaries.findById(item.Salary);
        if (salary == null) {
            LOG.warn("Salary item [{}] names salary [{}], which does not exist", item.Id, item.Salary);
            return;
        }
        double gross = valueOf(salary.Gross);
        if (Integer.valueOf(INCOMING)
                   .equals(item.Direction)) {
            gross += valueOf(item.Quantity);
        }
        double net = valueOf(salary.Net) + valueOf(item.Amount);
        salaries.updateProperties(salary.Id, Map.of("Gross", gross, "Net", net));
    }

    private static double valueOf(Double value) {
        return value == null ? 0 : value;
    }
}
