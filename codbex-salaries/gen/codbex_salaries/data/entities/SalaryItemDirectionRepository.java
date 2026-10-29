package gen.codbex_salaries.data.entities;

import org.eclipse.dirigible.components.data.store.java.repository.JavaRepository;
import org.eclipse.dirigible.sdk.component.Component;
import org.eclipse.dirigible.sdk.component.Repository;

@Repository
@Component("codbex_salaries_SalaryItemDirectionRepository")
public class SalaryItemDirectionRepository extends JavaRepository<SalaryItemDirectionEntity> {

    public SalaryItemDirectionRepository() {
        super(SalaryItemDirectionEntity.class);
    }

    @Override
    public SalaryItemDirectionEntity save(SalaryItemDirectionEntity entity) {
        SalaryItemDirectionEntity saved = insert(entity);
        return saved;
    }

    /**
     * The last steps of a create, once every guard has passed: the status stamps, the document number
     * and the insert itself - run inside the reference check's transaction when this entity has one.
     */
    private SalaryItemDirectionEntity insert(SalaryItemDirectionEntity entity) {
        // The create event is handed to the write itself, which records it in the tenant's event outbox
        // INSIDE the insert's transaction: row and event commit together, so a broker outage can
        // neither swallow an event whose row exists nor fail a call whose row was written. Listeners
        // (intent process triggers, the reactions under gen/events) see it the moment it is durable.
        return super.save(entity, "codbex-salaries-entities-SalaryItemDirection");
    }

    @Override
    public SalaryItemDirectionEntity update(SalaryItemDirectionEntity entity) {
        // The update event is recorded in the event outbox inside this write's own transaction - see
        // save() - so the intent reactions under gen/events see exactly the changes that committed.
        SalaryItemDirectionEntity updated = super.update(entity, "codbex-salaries-entities-SalaryItemDirection-updated");
        return updated;
    }

    /**
     * Persists changes WITHOUT publishing the "-updated" event. Intended for system-managed
     * back-references — e.g. an intent process trigger writing ProcessId back onto the entity that
     * started it. Going through {@link #update} would re-publish "SalaryItemDirection-updated" and spuriously
     * re-fire onUpdate reactions (notifications, roll-ups, integrations) for a change the user never made.
     */
    public SalaryItemDirectionEntity updateWithoutEvent(SalaryItemDirectionEntity entity) {
        SalaryItemDirectionEntity updated = super.update(entity);
        return updated;
    }

    /**
     * Targeted write of DERIVED columns - roll-up totals and keyed aggregates maintained by the generated
     * handlers under {@code gen/events} - that keeps the {@code "-updated"} event contract.
     *
     * <p>
     * Only the named columns are persisted, so a concurrent user write to any other column of the row
     * cannot be reverted: a handler that read the row, recomputed one total and then merged the WHOLE row
     * back silently reverted whatever the user changed in that window (the lost-update family of #6226 /
     * #6306). The {@code "-updated"} event still fires so downstream reactions - notably a transitive
     * roll-up whose own parent sits above this row - keep cascading exactly as they did when the handler
     * persisted the full row, carrying the written column names under {@code DerivedWrite.MARKER} so an
     * authored-change listener can skip a recompute that moved nothing it watches. Routed through
     * {@link #updateProperties} so an entity that declares
     * {@code checks:} still runs its gate, a labelled entity still refreshes its stored display Name,
     * and a document line still resums the master it belongs to.
     */
    public int updateDerived(Object id, java.util.Map<String, Object> values) {
        if (values == null || values.isEmpty()) {
            return 0;
        }
        // The event travels with the write: the resulting row is read back on the write's own
        // connection, before its commit, and recorded in the event outbox alongside it. It is MARKED
        // with the columns written, so a listener that reacts to authored changes only - a settlement
        // re-allocating a corrected payment - can tell this recompute from an edit (#7557).
        return org.eclipse.dirigible.components.data.store.java.repository.DerivedWrite.run(values.keySet(),
                () -> updateProperties(id, values, "codbex-salaries-entities-SalaryItemDirection-updated"));
    }

    /**
     * The record this create would store, as far as its calculated fields go - the row the controller's
     * checks read before the write (#7544). The calculated expressions are assigned inside save(), so a
     * check reading the submitted record saw whatever the caller sent for a calculated field (usually
     * nothing, or the value of a previous save) and a soft or hard check on one never fired for a REST
     * write. The defaults the create applies come first, as in save(), since an expression may read
     * them. Only the neutral expressions are evaluated: a calculated ACTION may mint or mutate state,
     * and runs on the write path alone. The submitted record itself is not touched - what is persisted
     * is still computed by save().
     *
     * @param submitted the record about to be created
     * @return a copy carrying the computed values, or the record itself when nothing is calculated
     */
    public SalaryItemDirectionEntity calculatedForCreate(SalaryItemDirectionEntity submitted) {
        return submitted;
    }

    /**
     * The record this update would store, as far as its calculated and system-owned fields go - the row
     * the controller's checks read before the write (#7544). Built as update() builds it: the
     * system-owned fields taken from the stored row, the document totals recomputed, then the
     * update-time expressions - so an expression such as Balance = Total - Paid reads the stored Paid,
     * never the payload's. The same holds for a check that reads a system-owned field directly (#7633):
     * a forbidWhen over a readOnly counter a roll-up maintains judges the stored counter, so a payload
     * that omits the column, or carries a harmless value for it, cannot walk past the refusal. Only the
     * neutral expressions are evaluated (an action runs on the write path alone), and the submitted
     * record itself is not touched.
     *
     * @param submitted the record about to be updated, carrying its id
     * @return a copy carrying the stored and computed values, or the record itself when the entity has
     *         nothing calculated and nothing system-owned
     */
    public SalaryItemDirectionEntity calculatedForUpdate(SalaryItemDirectionEntity submitted) {
        return submitted;
    }

    @Override
    public void delete(SalaryItemDirectionEntity entity) {
        // The delete event is recorded in the event outbox inside this write's own transaction - see
        // save() - so the intent reactions under gen/events cannot miss a row that is really gone.
        super.delete(entity, "codbex-salaries-entities-SalaryItemDirection-deleted");
    }

    @Override
    public void deleteById(Object id) {
        // The payload is the row as the deleting transaction read it, recorded in the event outbox
        // beside the delete itself - see save().
        super.deleteById(id, "codbex-salaries-entities-SalaryItemDirection-deleted");
    }

}
