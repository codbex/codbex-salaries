package gen.codbex_salaries.data.salaries;

import org.eclipse.dirigible.components.data.store.java.repository.JavaRepository;
import org.eclipse.dirigible.sdk.component.Component;
import org.eclipse.dirigible.sdk.component.Repository;
import org.eclipse.dirigible.components.data.store.java.repository.UnitOfWork;

@Repository
@Component("codbex_salaries_SalaryRepository")
public class SalaryRepository extends JavaRepository<SalaryEntity> {

    public SalaryRepository() {
        super(SalaryEntity.class);
    }

    @Override
    public SalaryEntity save(SalaryEntity entity) {
        if (entity.Gross == null) {
            entity.Gross = Double.valueOf("0");
        }
        if (entity.Net == null) {
            entity.Net = Double.valueOf("0");
        }
        // The reference check and the insert are ONE transaction, and the check share-locks every row
        // this create names until it commits (#8252): a delete of one of them either waits for the
        // insert and then counts it, or has deleted the row the check waits for and refuses this create
        // - checked and inserted apart, both won and the row pointed at nothing. The check comes before
        // the number is drawn, so a refused create spends none.
        SalaryEntity saved = org.eclipse.dirigible.components.data.store.java.repository.UnitOfWork.call(() -> {
            requireReferencesExist(entity, null);
            return insert(entity);
        });
        return saved;
    }

    /**
     * The last steps of a create, once every guard has passed: the status stamps, the document number
     * and the insert itself - run inside the reference check's transaction when this entity has one.
     */
    private SalaryEntity insert(SalaryEntity entity) {
        // The create event is handed to the write itself, which records it in the tenant's event outbox
        // INSIDE the insert's transaction: row and event commit together, so a broker outage can
        // neither swallow an event whose row exists nor fail a call whose row was written. Listeners
        // (intent process triggers, the reactions under gen/events) see it the moment it is durable.
        return super.save(entity, "codbex-salaries-Salaries-Salary");
    }

    @Override
    public SalaryEntity update(SalaryEntity entity) {
        keepDefaultedWhenOmitted(entity);
        SalaryEntity referencesStored = entity.Id == null ? null : super.findById(entity.Id);
        // The update event is recorded in the event outbox inside this write's own transaction - see
        // save() - so the intent reactions under gen/events see exactly the changes that committed.
        // The reference check and the update are ONE transaction, the rows it names share-locked until
        // it commits - see save() (#8252).
        SalaryEntity updated = org.eclipse.dirigible.components.data.store.java.repository.UnitOfWork.call(() -> {
            requireReferencesExist(entity, referencesStored);
            return super.update(entity, "codbex-salaries-Salaries-Salary-updated");
        });
        return updated;
    }

    /**
     * Persists changes WITHOUT publishing the "-updated" event. Intended for system-managed
     * back-references — e.g. an intent process trigger writing ProcessId back onto the entity that
     * started it. Going through {@link #update} would re-publish "Salary-updated" and spuriously
     * re-fire onUpdate reactions (notifications, roll-ups, integrations) for a change the user never made.
     */
    public SalaryEntity updateWithoutEvent(SalaryEntity entity) {
        keepDefaultedWhenOmitted(entity);
        SalaryEntity referencesStored = entity.Id == null ? null : super.findById(entity.Id);
        // The reference check and the write are ONE transaction - see save() (#8252).
        SalaryEntity updated = org.eclipse.dirigible.components.data.store.java.repository.UnitOfWork.call(() -> {
            requireReferencesExist(entity, referencesStored);
            return super.update(entity);
        });
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
                () -> updateProperties(id, values, "codbex-salaries-Salaries-Salary-updated"));
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
    public SalaryEntity calculatedForCreate(SalaryEntity submitted) {
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
    public SalaryEntity calculatedForUpdate(SalaryEntity submitted) {
        SalaryEntity entity = copyOf(submitted);
        keepDefaultedWhenOmitted(entity);
        return entity;
    }

    private static SalaryEntity copyOf(SalaryEntity source) {
        SalaryEntity copy = new SalaryEntity();
        copy.Id = source.Id;
        copy.Employee = source.Employee;
        copy.Currency = source.Currency;
        copy.Status = source.Status;
        copy.Role = source.Role;
        copy.StartDate = source.StartDate;
        copy.EndDate = source.EndDate;
        copy.Gross = source.Gross;
        copy.Net = source.Net;
        return copy;
    }

    /**
     * Keeps the stored value of every defaulted field ({@code defaultValue:}, a relation's
     * {@code init:}) this update leaves null (#8105). A caller sends the fields its form edits, so a
     * field it leaves out is not a clear - and the default applies on create only, so without this the
     * update erased it, or failed on the NOT NULL column with a 500 quoting the statement. The stored row
     * is read only when such a field is actually null, through the base find, so a translated read never
     * stands in for the stored value.
     *
     * @param entity the record about to be updated, completed in place
     */
    private void keepDefaultedWhenOmitted(SalaryEntity entity) {
        if (entity.Id == null || ( entity.Gross != null &&  entity.Net != null)) {
            return;
        }
        SalaryEntity stored = super.findById(entity.Id);
        if (stored == null) {
            return;
        }
        if (entity.Gross == null) {
            entity.Gross = stored.Gross;
        }
        if (entity.Net == null) {
            entity.Net = stored.Net;
        }
    }

    @Override
    public void delete(SalaryEntity entity) {
        // The record and the children it owns leave together or not at all: a repository call is
        // otherwise its own transaction, so a failure half-way through the cascade would commit some of
        // the children and keep the record - the orphan state this cascade exists to prevent.
        UnitOfWork.run(() -> {
            // Refused by a referencing record's whenTargetDeleted: restrict BEFORE the children are
            // touched - the history trail is not part of the transaction, so a later refusal would leave
            // it recording child deletes that were rolled back. Inside the unit, so the record is locked
            // before its references are counted and a write naming it cannot slip in between (#8252).
            requireDeletable(entity.Id);
            deleteWithOwnedChildren(entity);
        });
    }

    /** The delete of this Salary itself, running inside the unit of work above. */
    private void deleteWithOwnedChildren(SalaryEntity entity) {
        deleteOwnedChildren(entity.Id);
        // The delete event is recorded in the event outbox inside this write's own transaction - see
        // save() - so the intent reactions under gen/events cannot miss a row that is really gone.
        super.delete(entity, "codbex-salaries-Salaries-Salary-deleted");
    }

    @Override
    public void deleteById(Object id) {
        // One transaction for the record and the children it owns, the record locked and its references
        // counted before the children are touched - see delete(entity).
        UnitOfWork.run(() -> {
            requireDeletable(id);
            deleteByIdWithOwnedChildren(id);
        });
    }

    /** The delete of this Salary itself, running inside the unit of work above. */
    private void deleteByIdWithOwnedChildren(Object id) {
        deleteOwnedChildren(id);
        // The payload is the row as the deleting transaction read it, recorded in the event outbox
        // beside the delete itself - see save().
        super.deleteById(id, "codbex-salaries-Salaries-Salary-deleted");
    }

    /**
     * Deletes the children this Salary OWNS - the composition relations authored on those children,
     * which is what makes them details of this record rather than independent rows - as the first step
     * of deleting it.
     *
     * <p>
     * They go in this same transaction and through their own repository, so each child's
     * {@code -deleted} event is recorded in the outbox beside the delete, its own history and cascade
     * run, and every roll-up over the child relinquishes what it counted. A child whose relation
     * declares {@code whenMasterDeleted: refuse} is the author's alternative: it REFUSES this delete
     * while any of its rows exist, rather than being swept away with the record. Either way nothing is
     * left pointing at a Salary that is gone - an orphan is invisible in the UI, since no parent page
     * renders it, and still counted by every report and roll-up over the child.
     */
    private void deleteOwnedChildren(Object id) {
        if (id == null) {
            return;
        }
        gen.codbex_salaries.data.salaries.SalaryItemRepository SalaryItemOwner =
                new gen.codbex_salaries.data.salaries.SalaryItemRepository();
        for (gen.codbex_salaries.data.salaries.SalaryItemEntity SalaryItemRow : SalaryItemOwner
                .findAll(org.eclipse.dirigible.components.data.store.java.repository.Criteria.create().eq("Salary", id))) {
            SalaryItemOwner.delete(SalaryItemRow);
        }
    }

    /**
     * Refuses a new Salary that names, through one of its to-one relations, a record that does not
     * exist (dirigible #8100) - the check save() makes, for a caller that must ask BEFORE a side effect
     * the write cannot take back, as the attachment upload stores its files first.
     */
    public void requireReferencesExist(SalaryEntity entity) {
        requireReferencesExist(entity, null);
    }

    /**
     * Refuses a write whose to-one relation names a record that does not exist (dirigible #8100):
     * same-model and cross-model alike, by the target's generated entity class - a 400 naming the
     * relation instead of a stored row pointing at nothing. On an update only a reference the write
     * CHANGES is asked: one it carries back as stored is not the caller's choice, so a row stored
     * before this check existed stays editable. A {@code whenTargetDeleted: keep} relation is not
     * checked at all - its reference outlives its target by declaration.
     *
     * @param stored the row as stored before this write, {@code null} for a create
     */
    private void requireReferencesExist(SalaryEntity entity, SalaryEntity stored) {
        if (stored == null || !java.util.Objects.equals(stored.Employee, entity.Employee)) {
            requireReferenceExists("Employee", "gen.codbex_employees.data.employees.EmployeeEntity", entity.Employee);
        }
        if (stored == null || !java.util.Objects.equals(stored.Currency, entity.Currency)) {
            requireReferenceExists("Currency", "gen.codbex_currencies.data.currencies.CurrencyEntity", entity.Currency);
        }
        if (stored == null || !java.util.Objects.equals(stored.Status, entity.Status)) {
            requireReferenceExists("Status", "gen.codbex_salaries.data.settings.SalaryStatusEntity", entity.Status);
        }
        if (stored == null || !java.util.Objects.equals(stored.Role, entity.Role)) {
            requireReferenceExists("Role", "gen.codbex_companies.data.companies.JobRoleEntity", entity.Role);
        }
    }

}
