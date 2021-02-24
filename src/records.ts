import type { Base, Table, View, TableOrViewQueryResult } from '@airtable/blocks/models'
import { Table as T } from './types/tables'
import { Record as R } from './types/records'
import { tables } from './tables'

declare const base: Base

export const records = (function () {
	async function selectRecordsFromModel(
		tableOrView: Table | View,
		opts?: T.QueryOpts
	): Promise<TableOrViewQueryResult> {
		const result = await tableOrView.selectRecordsAsync(opts || {})
		if (!result.records.length) {
			console.warn(`Model "${tableOrView.name}" does not have any records.`)
		}
		return result
	}

	async function throttleTableUsage(
		records: R.ModifiedRecord[],
		fn: (records: R.ModifiedRecord[]) => Promise<string[] | void>
	): Promise<string[] | void> {
		const results: string[] = []
		let index = 0
		while (records.length > index) {
			const round = records.slice(index, 50)
			let r = (await fn(round)) as string[] | void
			if (r) results.push(...r)
			index = index + 50
		}
		return results
	}

	return {
		selectRecords(args: {
			table: Table | string
			view?: View | string
			opts?: T.QueryOpts
		}): Promise<TableOrViewQueryResult> {
			let { table, view, opts } = args
			const Table: Table =
				typeof table === 'string' ? tables.getTable(table) : (table as Table)
			if (table === null)
				throw new Error(`No table with name or id "${table}" found.`)
			const View: View =
				view && typeof view === 'string'
					? tables.getView(table, view)
					: (view as View)

			if (!Table || (view && !View)) {
				throw new Error(`Select Records: Unable to find Model.`)
			}
			return View
				? selectRecordsFromModel(View, opts)
				: selectRecordsFromModel(Table, opts)
		},
		async createRecords(args: {
			table: Table | string
			records: { fields: R.LockedRecordFields }[]
		}): Promise<string[]> {
			const { table, records } = args
			const Table: Table =
				typeof table === 'string' ? tables.getTable(table) : (table as Table)
			if (!Table.hasPermissionToCreateRecords()) {
				throw new Error(
					`You do not have permission to create records in table "${Table.name}"`
				)
			}
			const results = await throttleTableUsage(
				records,
				(records: R.ModifiedRecord[]) =>
					Table.createRecordsAsync(
						records as { fields: R.LockedRecordFields }[]
					)
			)
			return Array.isArray(results) ? results : []
		},
		async updateRecords(args: {
			table: Table | string
			records: R.ModifiedRecord[]
		}): Promise<void> {
			const { table, records } = args
			const Table: Table =
				typeof table === 'string' ? tables.getTable(table) : (table as Table)
			if (!Table.hasPermissionToUpdateRecords()) {
				throw new Error(
					`You do not have permission to update records in table ${Table.name}`
				)
			}
			await this.throttleTableUsage(records, (records: R.ModifiedRecord[]) =>
				Table.updateRecordsAsync(records as R.UpdateRecord[])
			)
		},

		async deleteRecords(args: {
			table: Table | string
			recordIds: string[]
		}): Promise<void> {
			const { table, recordIds } = args
			const Table: Table =
				typeof table === 'string' ? tables.getTable(table) : (table as Table)
			if (!Table.hasPermissionToDeleteRecords()) {
				throw new Error(
					`You do not have permission to delete records in table ${Table.name}`
				)
			}
			await this.throttleTableUsage(recordIds, (recordIds: R.ModifiedRecord[]) =>
				Table.deleteRecordsAsync(recordIds as string[])
			)
		},
	}
})()
