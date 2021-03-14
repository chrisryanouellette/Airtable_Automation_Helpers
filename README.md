# Airtable Automation Helpers Package

This package provides some functions for interacting with the Airtable Blocks SDK.

This package is designed to be used with Airtable Mappings that can be created by this Custom App.

## Working Example

1. Create a new Table and leave all the default fields. ( Name, Notes, Attachments, Status )
2. Add some info to each field for the demo.
3. Create a new automation with a trigger of 'When record is updated'.
4. Create a 'Run Script' automation action.
5. Use the [Mapping App](https://github.com/chrisryanouellette/Airtable_Mapping_App) to create the mappings for the Table.
6. Remove any starter code from the new script and paste the [demo file's](demo/demo_automation.js) contents in its place.
7. Replace the example mappings with the ones you created.
8. Run the Script.

## Function Examples

### Loading Records

```js
const records = []
try {
    /** @type {RecordQueryResult} */
    const res = await AT.selectRecords({
        table: mappings.tables.myTable.id
    })
    records.push(...AT.convertFieldsToNames({
        table: mappings.tables.myTable.id,
        records: rec.records,
        mappings: mappings.views
    }))
} catch(error) {
    console.error('THERE WAS AN ERROR LOADING REOCRDS', error)
}
```

### Creating Records

```js
const records = [{
    fields: {
        myField: 'my field value'
    }
}]
try {
    await AT.createRecords({
        table: mappings.tables.myTable.id,
        records: records.map(rec => ({
            fields: AT.convertFieldsToIds({
                table: mappings.tables.myTable.id,,
                fields: rec.fields,
                mappings: mappings.views
            })
        }))
    })
} catch(error) {
    console.error('THERE WAS AN ERROR CREATING REOCRDS', error)
}
```

### Updating Records

```js
const records = [{
    id: 'rec123123',
    tableId: 'tbl321123',
    name: 'My Record',
    fields: {
        myField: 'my field value'
    }
}]
try {
    await AT.updateRecords({
        table: mappings.tables.myTable.id,
        records: records.map(rec => ({
            id: rec.id,
            fields: AT.convertFieldsToIds({
                table: mappings.tables.myTable.id,,
                fields: rec.fields,
                mappings: mappings.views
            })
        }))
    })
} catch(error) {
    console.error('THERE WAS AN ERROR UPDATING REOCRDS', error)
}
```

### Deleting Records

```js
const records = [{
    id: 'rec123123',
    tableId: 'tbl321123',
    name: 'My Record',
    fields: {
        myField: 'my field value'
    }
}]
try {
    await AT.deleteRecords({
        table: mappings.tables.myTable.id,
        recordIds: records.map(rec => rec.id)
    })
} catch(error) {
    console.error('THERE WAS AN ERROR DELETING REOCRDS', error)
}
```

## API Documentation

### Tables

```typescript
/** Mapping refers to ./scr/types/mappings.ts */

AT.getTable(tableNameOrId: string): Table | null
AT.getView(table: Table | string, viewNameOrId: string): View | null
AT.getField(table: Table | string, fieldNameOrId: string): Field | null
AT.getFields(table: Table | string, fieldNamesOrIds: string[]): Field[]
/** Returns the View mappings for a Table */
AT.getMappingsForTable(args: {
    table: Table | string
    mappings: { [label: string]: Mapping.ViewMapping }
    opts?: {
        refNames?: string[]
    }
}): { [refName: string]: Mapping.ViewMapping }
/** Returns the Field mappings for View*/
AT.getMappingsForView(args: {
    view: View | string
    mappings: { [label: string]: Mapping.ViewMapping }
    opts?: {
        refNames?: string[]
        fieldIds?: string[]
    }
}): { [refName: string]: Mapping.FieldMapping }
/** Returns the Field Mappings from a View Mapping */
AT.getMappingsForViews(args: {
    viewMappings: {
        [refName: string]: Mapping.ViewMapping
    }
}): { [refName: string]: Mapping.FieldMapping }
```

### Records

```typescript
/** T refers to ./src/types/table.ts */
/** R refers to ./src/types/record.ts */

AT.selectRecords(args: {
    table: Table | string
    view?: View | string
    opts?: T.QueryOpts
}): Promise<TableOrViewQueryResult>
AT.createRecords(args: {
    table: Table | string
    records: { fields: R.LockedRecordFields }[]
}): Promise<string[]>
AT.updateRecords(args: {
    table: Table | string
    records: R.ModifiedRecord[]
}): Promise<void>
AT.deleteRecords(args: {
    table: Table | string
    recordIds: string[]
}): Promise<void>
```

### Record Cells

```typescript
/** T refers to ./src/types/table.ts */
/** R refers to ./src/types/record.ts */
/** Mapping refers to ./scr/types/mappings.ts */

/** Uses Field Mappings form a View Mapping to convert an AT Record to a CustomRecord */
AT.convertFieldsToNames(args: {
    table: Table | string
    records: Record[]
    mappings: { [label: string]: Mapping.ViewMapping }
}): R.Record<{ [refName: string]: R.CutomField }>[]
/** Uses Field Mappings from a View Mapping to convert a CustomRecord's fields
 * from the reference names to the fields IDs
 * 
 * If opt.fieldsOnly is not present or is false, all fields in the View will be returned.
 *  Missing fields will be null
 */
AT.convertFieldsToIds(args: {
    table: Table | string
    fields: { [index: string]: R.CutomField }
    mappings: { [label: string]: Mapping.ViewMapping }
    opts?: {
        fieldsOnly: boolean
    }
}): R.LockedRecordFields
/** Formats a value returned from record.getCellValue */
formatCellValue(
    field: Mapping.FieldMapping,
    value: unknown
): T.FieldTypes
```

### Remote Records ( Records from another Base )

These function require that a string variable named `APIKEY` is defined globally. 

```typescript
/** R refers to ./src/types/record.ts */
/** Remote refers to ./src/types/remote.ts */

AT.remote.selectRecords({
    baseId: string,
    tableId: string,
    query?: {
        view?: string
        fields?: string[]
        filterByFormula?: string
    }
})
AT.remote.createRecords (args: {
    baseId: string
    tableId: string
    records: R.LockedRecordFields[]
}): Promise<Remote.CreateOrUpdateResponse[]>
AT.remote.updateRecords(args: {
    baseId: string
    tableId: string
    records: R.UpdateRecord[]
}): Promise<Remote.CreateOrUpdateResponse[]>
AT.remote.deleteRecords(args: {
    baseId: string
    tableId: string
    recordIds: string[]
}): Promise<Remote.DeleteResponce[]>
```

### Utilities

```typescript
AT.formatDate(date: Date): string // Ex, 01/01/1996
AT.formatTime(date: Date): string // Ex, 01:00 AM
AT.format(date: Date): string // Ex, 01/01/1996 01:00 AM
```