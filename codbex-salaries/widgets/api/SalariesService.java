package widgets.api;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import gen.codbex_currencies.data.settings.CurrencyRepository;
import gen.codbex_salaries.data.salaries.SalaryEntity;
import gen.codbex_salaries.data.salaries.SalaryRepository;

import org.eclipse.dirigible.components.data.store.java.repository.Criteria;
import org.eclipse.dirigible.sdk.http.Controller;
import org.eclipse.dirigible.sdk.http.Get;

/**
 * The figures of the dashboard's Salaries Sum widget.
 */
@Controller
public class SalariesService {

    /** The status of an active salary. */
    private static final int ACTIVE = 1;

    private final SalaryRepository salaries;

    private final CurrencyRepository currencies;

    public SalariesService(SalaryRepository salaries, CurrencyRepository currencies) {
        this.salaries = salaries;
        this.currencies = currencies;
    }

    /**
     * The net amounts of the active salaries, summed, in the currency of the first of them.
     *
     * @return {@code salariesSum} and {@code currency} - the latter {@code null} when no salary is active
     */
    @Get("/SalariesSum")
    public Map<String, Object> salariesSum() {
        List<SalaryEntity> active = salaries.findAll(Criteria.create()
                                                             .eq("Status", ACTIVE));
        double sum = active.stream()
                           .map(salary -> salary.Net)
                           .filter(Objects::nonNull)
                           .mapToDouble(Double::doubleValue)
                           .sum();
        Integer currency = active.isEmpty() ? null : active.get(0).Currency;

        Map<String, Object> figures = new LinkedHashMap<>();
        figures.put("salariesSum", sum);
        figures.put("currency", currency == null ? null : currencies.findOne(currency)
                                                                     .map(found -> found.Code)
                                                                     .orElse(null));
        return figures;
    }
}
