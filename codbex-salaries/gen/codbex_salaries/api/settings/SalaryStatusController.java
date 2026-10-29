package gen.codbex_salaries.api.settings;

import gen.codbex_salaries.data.settings.SalaryStatusEntity;
import gen.codbex_salaries.data.settings.SalaryStatusRepository;

import org.eclipse.dirigible.components.api.security.UserFacade;
import org.eclipse.dirigible.sdk.platform.Documentation;
import org.eclipse.dirigible.sdk.http.Body;
import org.eclipse.dirigible.sdk.component.Component;
import org.eclipse.dirigible.sdk.http.Controller;
import org.eclipse.dirigible.sdk.http.Delete;
import org.eclipse.dirigible.sdk.http.Get;
import org.eclipse.dirigible.sdk.http.PathParam;
import org.eclipse.dirigible.sdk.http.Post;
import org.eclipse.dirigible.sdk.http.Put;
import org.eclipse.dirigible.sdk.http.QueryParam;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Controller
@Component("codbex_salaries_SalaryStatusController")
@Documentation("codbex-salaries - SalaryStatus Controller")
public class SalaryStatusController {

    private static final Set<String> FILTER_FIELDS = Set.of("Id", "Name");

    private final SalaryStatusRepository repository;

    public SalaryStatusController(SalaryStatusRepository repository) {
        this.repository = repository;
    }

    @Get
    @Documentation("List SalaryStatus")
    public List<SalaryStatusEntity> getAll(@QueryParam("$limit") Integer limit,
                                      @QueryParam("$offset") Integer offset) {
        checkPermissions("read");
        int actualLimit = limit != null ? limit.intValue() : 20;
        int actualOffset = offset != null ? offset.intValue() : 0;
        List<SalaryStatusEntity> result = repository.findAll(actualLimit, actualOffset);
        return result;
    }

    @Get("/count")
    @Documentation("Count SalaryStatus")
    public Map<String, Long> count() {
        checkPermissions("read");
        return Map.of("count", repository.count());
    }

    @Post("/count")
    @Documentation("Count SalaryStatus with filter")
    public Map<String, Long> countWithFilter(@Body Map<String, Object> filter) {
        checkPermissions("read");
        // counted in the database, not by loading every matching row (dirigible #7982)
        Map<String, Object> params = new LinkedHashMap<>();
        String where = filterWhere(filter, params);
        return Map.of("count", repository.countQuery("select count(e) from codbex_salaries_SalaryStatusEntity e" + where, params));
    }

    @Post("/search")
    @Documentation("Search SalaryStatus")
    public List<SalaryStatusEntity> search(@Body Map<String, Object> filter) {
        checkPermissions("read");
        List<SalaryStatusEntity> result = runFilter(filter);
        return result;
    }

    @Get("/{id}")
    @Documentation("Get SalaryStatus by id")
    public SalaryStatusEntity getById(@PathParam("id") Integer id) {
        checkPermissions("read");
        SalaryStatusEntity entity = repository.findOne(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "SalaryStatus not found"));
        return entity;
    }

    @Get("/access")
    @Documentation("What the CURRENT caller may do with SalaryStatus: read and write, by the same gates every endpoint applies - what the generated pages show or hide their write controls by; the 403 of each write stays authoritative")
    public Map<String, Boolean> access() {
        // Never a 403: a caller who may not read is told so, the way a reader is told it may not write.
        return Map.of("read", mayRead(), "write", mayWrite());
    }

    @Post
    @Documentation("Create SalaryStatus")
    public SalaryStatusEntity create(@Body SalaryStatusEntity entity) {
        checkPermissions("write");
        // The checks read the record as the write will store it - its calculated fields computed, not
        // taken from the payload (#7544). What is persisted is still computed by the repository.
        SalaryStatusEntity checked = repository.calculatedForCreate(entity);
        validate(checked);
        SalaryStatusEntity saved = repository.save(entity);
        return repository.findOne(saved.Id).orElse(saved);
    }

    @Put("/{id}")
    @Documentation("Update SalaryStatus by id")
    public SalaryStatusEntity update(@PathParam("id") Integer id, @Body SalaryStatusEntity entity) {
        checkPermissions("write");
        entity.Id = id;
        // The checks read the record as the write will store it - its calculated fields computed, not
        // taken from the payload (#7544). What is persisted is still computed by the repository.
        SalaryStatusEntity checked = repository.calculatedForUpdate(entity);
        validate(checked);
        return repository.update(entity);
    }

    @Delete("/{id}")
    @Documentation("Delete SalaryStatus by id")
    public void deleteById(@PathParam("id") Integer id) {
        checkPermissions("write");
        if (repository.findOne(id).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "SalaryStatus not found");
        }
        try {
            repository.deleteById(id);
        } catch (RuntimeException e) {
            // A foreign-key violation means other records still reference this one - a data-integrity
            // conflict the user can act on, not a server error.
            if (isConstraintViolation(e)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "This SalaryStatus is referenced by other records and cannot be deleted");
            }
            throw e;
        }
    }

    /** Whether a persistence failure is (caused by) a database constraint violation. */
    private static boolean isConstraintViolation(Throwable e) {
        for (Throwable cause = e; cause != null; cause = cause.getCause() == cause ? null : cause.getCause()) {
            String type = cause.getClass().getName();
            if (type.contains("ConstraintViolation") || type.contains("DataIntegrityViolation")) {
                return true;
            }
        }
        return false;
    }

    private List<SalaryStatusEntity> runFilter(Map<String, Object> filter) {
        Map<String, Object> params = new LinkedHashMap<>();
        StringBuilder hql = new StringBuilder("from codbex_salaries_SalaryStatusEntity e").append(filterWhere(filter, params));
        // a stable order, so that a page of the result means the same rows on every call
        hql.append(" order by e.Id");
        // The page the caller asked for, in the body next to the conditions (dirigible #7982): the
        // shell's report widgets ask for $limit 1 or 5 and were handed every matching row.
        return repository.query(hql.toString(), params, pageParameter(filter, "$limit", -1), pageParameter(filter, "$offset", 0));
    }

    /**
     * The {@code $limit} / {@code $offset} of a search body - a number or a numeric string.
     */
    private static int pageParameter(Map<String, Object> filter, String key, int absent) {
        Object value = filter == null ? null : filter.get(key);
        if (value instanceof Number number) {
            return number.intValue();
        }
        if (value instanceof String text && !text.isBlank()) {
            try {
                return Integer.parseInt(text.trim());
            } catch (NumberFormatException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid " + key + ": " + text);
            }
        }
        return absent;
    }

    /**
     * The {@code where} clause of a search body's {@code equals} and {@code conditions}, binding their
     * values into {@code params} - shared by the search and its count.
     */
    private String filterWhere(Map<String, Object> filter, Map<String, Object> params) {
        StringBuilder hql = new StringBuilder();
        boolean first = true;
        if (filter != null && filter.get("equals") instanceof Map<?, ?> equals) {
            for (Map.Entry<?, ?> entry : equals.entrySet()) {
                String field = requireKnownField(String.valueOf(entry.getKey()));
                String paramName = "p" + params.size();
                hql.append(first ? " where e." : " and e.").append(field).append(" = :").append(paramName);
                params.put(paramName, coerceValue(field, entry.getValue()));
                first = false;
            }
        }
        if (filter != null && filter.get("conditions") instanceof List<?> conditions) {
            for (Object raw : conditions) {
                if (!(raw instanceof Map<?, ?> condition)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid filter condition");
                }
                String field = requireKnownField(String.valueOf(condition.get("propertyName")));
                String operator = String.valueOf(condition.get("operator")).toUpperCase(Locale.ROOT);
                Object value = condition.get("value");
                String paramName = "p" + params.size();
                String clause = switch (operator) {
                    case "EQ" -> "e." + field + " = :" + paramName;
                    case "IN" -> {
                        if (!(value instanceof Collection<?>)) {
                            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "IN value must be a list for field: " + field);
                        }
                        yield "e." + field + " in (:" + paramName + ")";
                    }
                    case "LIKE" -> "e." + field + " like :" + paramName;
                    // A half-open range [from, to) - what the slot picker asks for the days it shows (#7837).
                    case "GTE" -> "e." + field + " >= :" + paramName;
                    case "LT" -> "e." + field + " < :" + paramName;
                    default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported operator: " + operator);
                };
                hql.append(first ? " where " : " and ").append(clause);
                params.put(paramName, operator.equals("IN") ? value : coerceValue(field, value));
                first = false;
            }
        }
        return hql.toString();
    }

    private static String requireKnownField(String field) {
        if (!FILTER_FIELDS.contains(field)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown filter field: " + field);
        }
        return field;
    }

    // Coerce a JSON-sourced filter value to the entity property's Java type so Hibernate can bind it.
    // Date/timestamp filters arrive as ISO strings and must become LocalDate/LocalDateTime/Instant,
    // else binding fails with "argument [2026-07-01] is not assignable to java.time.LocalDate". Reflects
    // the entity field type (the field is already validated against FILTER_FIELDS). LIKE/string values
    // and already-typed numbers pass through unchanged.
    private static Object coerceValue(String field, Object value) {
        if (!(value instanceof String s) || s.isBlank()) {
            return value;
        }
        try {
            Class<?> type = SalaryStatusEntity.class.getField(field)
                                                    .getType();
            if (type == java.time.LocalDate.class) {
                return java.time.LocalDate.parse(s);
            }
            if (type == java.time.LocalDateTime.class) {
                return java.time.LocalDateTime.parse(s);
            }
            if (type == java.time.Instant.class) {
                return java.time.Instant.parse(s);
            }
            if (type == Integer.class) {
                return Integer.valueOf(s);
            }
            if (type == Long.class) {
                return Long.valueOf(s);
            }
            if (type == java.math.BigDecimal.class) {
                return new java.math.BigDecimal(s);
            }
            if (type == Double.class) {
                return Double.valueOf(s);
            }
            if (type == Boolean.class || type == boolean.class) {
                return Boolean.valueOf(s);
            }
        } catch (ReflectiveOperationException | RuntimeException e) {
            // Unknown field or unparseable value: leave as-is and let Hibernate's validator report it.
        }
        return value;
    }

    private void checkPermissions(String op) {
        if (!("write".equals(op) ? mayWrite() : mayRead())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
    }

    /** The read gate every read endpoint applies - and what GET /access answers as {@code read}. */
    private static boolean mayRead() {
        return isInAnyRole("codbex-salaries.Settings.SalaryStatusReadOnly") || isInAnyRole("codbex-salaries.Settings.SalaryStatusFullAccess");
    }

    /** The write gate every write endpoint applies - and what GET /access answers as {@code write}. */
    private static boolean mayWrite() {
        return isInAnyRole("codbex-salaries.Settings.SalaryStatusFullAccess");
    }

    // Public so a process task's write-back (the generated <Process><Step>Write delegate) holds the
    // reviewer's edits to exactly these rules and messages before it writes them (#7552).
    public static void validate(SalaryStatusEntity entity) {
        if (entity.Name == null || entity.Name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The 'Name' property is required");
        }
        if (entity.Name.length() > 20) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "The 'Name' exceeds the maximum length of 20");
        }
    }

    /**
     * Whether the caller holds ANY of a comma-separated role list. One role name is what the entity
     * modeler's per-property read/write role and the convention-derived entity gates carry; a gate the
     * intent's `permissions[].can:` tokens authorized, and the intent's `visibleTo: [A, B]`
     * allow-list, arrive here as "A,B" and holding either of them is enough.
     */
    private static boolean isInAnyRole(String roles) {
        for (String role : roles.split(",")) {
            String name = role.trim();
            if (!name.isEmpty() && UserFacade.isInRole(name)) {
                return true;
            }
        }
        return false;
    }
}
